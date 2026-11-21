/* =========================================================
   Tech Mathura — shared script (all pages)
   - 3D particle scene (Three.js r149) that morphs between
     shapes as you scroll: 0 idea sphere · 1 browser · 2 phone
     · 3 tech-stack layers · 4 globe · 5 "TM" monogram
   - Each section says where the particles go with
       data-k ="x,y,scale,shape"   (desktop, > 1024px)
       data-km="x,y,scale,shape"   (tablet & phone)
   - Scroll reveals, pinned chapters, stacking cards, tabs,
     FAQ, mobile menu, forms, hover effects.
   ========================================================= */
(function () {
  'use strict';

  /* ---- Google Sheets: paste your Apps Script Web App URL between the quotes ----
     It looks like https://script.google.com/macros/s/XXXXXXXX/exec  (see README, step-by-step) */
  var FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwRx_qkfiChi1zdLDxTKNVGlHsUmQDzYhwgaFEYQOLCAmgC3v9BqOOVSib1U9u9ZP5F/exec';

  var root = document.documentElement;
  var isDesk = function () { return window.innerWidth > 1024; };
  var canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
  var lastW = window.innerWidth;
  var VH = function () { return window.innerHeight; };
  root.style.setProperty('--vh', VH() + 'px');

  var S = { active: null, chap: 0, shape: -1 };
  var cur = { x: 0, y: 0, s: 1, m: 0 }, tgt = { x: 0, y: 0, s: 1, m: 0 };
  var mouse = { x: 0, y: 0, on: false }, vel = 0, lastY = window.scrollY;
  var shapeNames = ['An idea', 'A website', 'An Android app', 'Your tech stack', 'A global launch', 'Tech Mathura'];
  var kAttr = function () { return isDesk() ? 'data-k' : 'data-km'; };
  var readK = function (el) {
    var v = el.getAttribute(kAttr()); if (!v) return null; v = v.split(',').map(Number);
    // tablets have taller screens: draw the shape a little larger
    var w = window.innerWidth; if (w > 640 && w <= 1024) { v[2] *= 1.35; v[1] *= .92; }
    return v;
  };

  /* ---------------- scroll engine ---------------- */
  function tick() {
    raf = null;
    var H = VH(), y = window.scrollY;
    vel = Math.min(1, Math.max(vel, Math.abs(y - lastY) / 80)); lastY = y;
    var max = document.documentElement.scrollHeight - H;
    root.style.setProperty('--sp', max > 0 ? (y / max).toFixed(4) : 0);
    var nav = document.querySelector('.nav'); if (nav) nav.classList.toggle('small', y > 30);

    var chapInfo = null;
    document.querySelectorAll('[data-prog]').forEach(function (el) {
      var r = el.getBoundingClientRect(), p;
      if (r.height - H > 60) p = -r.top / (r.height - H); else p = (H - r.top) / (H + r.height);
      p = Math.max(0, Math.min(1, p));
      el.style.setProperty('--p', p.toFixed(4));
      if (el.hasAttribute('data-chap') && isDesk()) {
        chapInfo = { p: p, top: r.top, bottom: r.bottom };
        setChap(Math.min(3, Math.floor(p * 4)));
      }
    });

    document.querySelectorAll('[data-sc]').forEach(function (c, i, all) {
      var nx = all[i + 1], f = 0;
      if (nx) { var cr = c.getBoundingClientRect(), nr = nx.getBoundingClientRect(); f = Math.max(0, Math.min(1, (cr.bottom - nr.top) / Math.max(1, cr.height))); }
      c.style.setProperty('--sc', (1 - f * .06).toFixed(4));
      c.style.setProperty('--br', (1 - f * .22).toFixed(4));
    });

    document.querySelectorAll('[data-rv]:not([data-in])').forEach(function (el) {
      if (el.getBoundingClientRect().top < H * .86) el.setAttribute('data-in', '');
    });

    // particle keyframes
    var ks = Array.prototype.filter.call(document.querySelectorAll('[' + kAttr() + ']'), function (e) { return e.offsetParent !== null || e.getClientRects().length; });
    var mid = H / 2;
    for (var k = 0; k < ks.length; k++) {
      var b = ks[k].getBoundingClientRect();
      if (b.top <= mid && b.bottom > mid) {
        var cv = readK(ks[k]), pv = ks[k - 1] ? readK(ks[k - 1]) : cv, nv = ks[k + 1] ? readK(ks[k + 1]) : cv;
        var L = function (a, c, q) { return { x: a[0] + (c[0] - a[0]) * q, y: a[1] + (c[1] - a[1]) * q, s: a[2] + (c[2] - a[2]) * q, m: a[3] + (c[3] - a[3]) * q }; };
        if (ks[k].hasAttribute('data-chap') && chapInfo) {
          var seg = Math.min(3, Math.floor(chapInfo.p * 4)), fr = chapInfo.p * 4 - seg;
          var mm = 1 + seg + (seg < 3 ? Math.max(0, Math.min(1, (fr - .6) / .4)) : 0);
          if (chapInfo.top > 0) { var e1 = Math.max(0, Math.min(1, 1 - chapInfo.top / H)); var o1 = L(pv, cv, e1); o1.m = pv[3] + (1 - pv[3]) * e1; tgt = o1; }
          else if (chapInfo.bottom < H) { var e2 = Math.max(0, Math.min(1, 1 - chapInfo.bottom / H)); var o2 = L(cv, nv, e2); o2.m = mm + (nv[3] - mm) * e2; tgt = o2; }
          else tgt = { x: cv[0], y: cv[1], s: cv[2], m: mm };
        } else {
          var t = (mid - b.top) / b.height, A, B, ff;
          if (t < .5) { A = pv; B = cv; ff = t + .5; } else { A = cv; B = nv; ff = t - .5; }
          ff = ff * ff * (3 - 2 * ff);
          tgt = L(A, B, ff);
        }
        break;
      }
    }
    setShape(Math.round(tgt.m));
    setActiveNav(mid);
  }
  var raf = null;
  function onScroll() { if (!raf) raf = requestAnimationFrame(tick); }

  function setChap(i) {
    if (i === S.chap) return; S.chap = i;
    document.querySelectorAll('[data-cp]').forEach(function (el) { el.classList.toggle('on', +el.getAttribute('data-cp') === i); });
    document.querySelectorAll('[data-jump]').forEach(function (el) { el.classList.toggle('on', +el.getAttribute('data-jump') <= i); });
  }
  function setShape(i) {
    if (i === S.shape) return; S.shape = i;
    var n = document.getElementById('shapeName'); if (n) n.textContent = shapeNames[i] || '';
  }
  function setActiveNav(mid) {
    var page = document.body.getAttribute('data-page'), act = null;
    document.querySelectorAll('.nbar [data-sec]').forEach(function (a) {
      if (a.getAttribute('data-page') !== page) return;
      var sec = document.getElementById(a.getAttribute('data-sec')); if (!sec) return;
      var r = sec.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) act = a.getAttribute('data-sec');
    });
    var key = act || page;
    if (key === S.active) return; S.active = key;
    document.querySelectorAll('[data-page]').forEach(function (a) {
      if (a === document.body) return;
      var on = act ? a.getAttribute('data-sec') === act && a.getAttribute('data-page') === page : (a.getAttribute('data-page') === page && !a.hasAttribute('data-sec'));
      a.classList.toggle('on', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  /* ---------------- particle shapes ---------------- */
  function buildShapes(N) {
    var R = Math.random, PI = Math.PI, J = function (a) { return (R() - .5) * a; };
    var superE = function (w, h, n, th) { var c = Math.cos(th), s = Math.sin(th); return [w / 2 * Math.sign(c) * Math.pow(Math.abs(c), 2 / n), h / 2 * Math.sign(s) * Math.pow(Math.abs(s), 2 / n)]; };
    var outline = function (w, h, n) { return function () { var p = superE(w, h, n, R() * PI * 2); return [p[0] + J(.04), p[1] + J(.04), J(.08)]; }; };
    var fill = function (x0, x1, y0, y1, z) { return function () { return [x0 + R() * (x1 - x0), y0 + R() * (y1 - y0), (z || 0) + J(.06)]; }; };
    var ring = function (cx, cy, r) { return function () { var a = R() * PI * 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, J(.05)]; }; };
    var mix = function (parts) { var tot = 0; parts.forEach(function (p) { tot += p[0]; }); return function () { var x = R() * tot; for (var i = 0; i < parts.length; i++) { x -= parts[i][0]; if (x <= 0) return parts[i][1](); } return parts[0][1](); }; };
    var g = [];
    g.push(function (i) { var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.399963, rad = 1.55 + J(.18) + (R() < .12 ? R() * .7 : 0); return [Math.cos(th) * r * rad, y * rad, Math.sin(th) * r * rad]; });
    g.push(mix([[30, outline(3.4, 2.3, 10)], [6, fill(-1.7, 1.7, .86, .9)], [3, ring(-1.5, 1, .05)], [3, ring(-1.35, 1, .05)], [3, ring(-1.2, 1, .05)], [22, fill(-1.45, 1.45, .2, .72, .05)], [8, fill(-1.45, -.55, -.85, -.1, .05)], [8, fill(-.45, .45, -.85, -.1, .05)], [8, fill(.55, 1.45, -.85, -.1, .05)], [4, fill(-1.45, .2, .02, .08)]]));
    g.push(mix([[34, outline(1.35, 2.7, 9)], [4, fill(-.2, .2, 1.18, 1.22)], [14, fill(-.5, .5, .55, 1, .05)], [6, ring(-.38, .25, .1)], [5, fill(-.18, .52, .23, .28)], [6, ring(-.38, -.15, .1)], [5, fill(-.18, .4, -.17, -.12)], [6, ring(-.38, -.55, .1)], [5, fill(-.18, .48, -.57, -.52)], [8, ring(.38, -.92, .14)], [5, fill(-.55, .55, -1.2, -1.16)]]));
    g.push(function () { var Lr = Math.floor(R() * 4), x, z; if (R() < .35) { var e = R() * 4, t = R() * 2.4 - 1.2; if (e < 1) { x = t; z = -1.2; } else if (e < 2) { x = t; z = 1.2; } else if (e < 3) { x = -1.2; z = t; } else { x = 1.2; z = t; } } else { x = Math.round((R() * 2.4 - 1.2) / .2) * .2 + J(.03); z = Math.round((R() * 2.4 - 1.2) / .2) * .2 + J(.03); } var y = -1.05 + Lr * .7 + J(.03), ax = .62, ay = .78; var y1 = y * Math.cos(ax) - z * Math.sin(ax), z1 = y * Math.sin(ax) + z * Math.cos(ax); return [(x * Math.cos(ay) + z1 * Math.sin(ay)) * .8, y1 * .8, (-x * Math.sin(ay) + z1 * Math.cos(ay)) * .8]; });
    g.push(function () { var rad = 1.55, u = R(), lat, lon; if (u < .3) { lat = (Math.floor(R() * 7) - 3) * .38; lon = R() * PI * 2; } else if (u < .6) { lon = Math.floor(R() * 12) / 12 * PI * 2; lat = (R() - .5) * PI; } else if (u < .8) { var a = R(), l1 = .5, o1 = .3, l2 = -.4, o2 = 2.2, k2 = Math.floor(R() * 3); if (k2 === 1) { l1 = -.7; o1 = 4; l2 = .9; o2 = 5.3; } if (k2 === 2) { l1 = .2; o1 = 2.6; l2 = -.2; o2 = 4.4; } lat = l1 + (l2 - l1) * a; lon = o1 + (o2 - o1) * a; rad = 1.55 + Math.sin(a * PI) * .45; } else { lat = Math.asin(R() * 2 - 1); lon = R() * PI * 2; } return [Math.cos(lat) * Math.cos(lon) * rad, Math.sin(lat) * rad, Math.cos(lat) * Math.sin(lon) * rad]; });
    var pts = [];
    try {
      var cv = document.createElement('canvas'); cv.width = 420; cv.height = 200; var cx = cv.getContext('2d');
      cx.fillStyle = '#fff'; cx.font = '800 170px Archivo, Arial, sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('TM', 210, 108);
      var d = cx.getImageData(0, 0, 420, 200).data;
      for (var yy = 0; yy < 200; yy += 2) for (var xx = 0; xx < 420; xx += 2) if (d[(yy * 420 + xx) * 4 + 3] > 128) pts.push([(xx - 210) / 210 * 2.1, -(yy - 100) / 210 * 2.1]);
    } catch (e) {}
    g.push(function () { if (!pts.length) return [J(3), J(1.5), 0]; var p = pts[Math.floor(R() * pts.length)]; return [p[0] + J(.02), p[1] + J(.02), J(.25)]; });
    return g;
  }

  /* ---------------- WebGL particle scene ---------------- */
  function initGL() {
    var T = window.THREE, canvas = document.getElementById('tm-gl');
    try {
      if (!T || !canvas) throw new Error('three.js missing');
      var mob = !isDesk();
      var renderer = new T.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
      var scene = new T.Scene(), cam = new T.PerspectiveCamera(35, 1, .1, 100); cam.position.z = 7.5;
      var cores = navigator.hardwareConcurrency || 4;
      var N = mob ? (cores >= 6 ? 9000 : 5500) : 18000;
      var gen = buildShapes(N), geo = new T.BufferGeometry();
      var first = null, dust = new Float32Array(N * 3), rnd = new Float32Array(N);
      for (var s = 0; s < 6; s++) { var arr = new Float32Array(N * 3); for (var i = 0; i < N; i++) { var p = gen[s](i); arr[i * 3] = p[0]; arr[i * 3 + 1] = p[1]; arr[i * 3 + 2] = p[2]; } if (!first) first = arr; geo.setAttribute('aP' + s, new T.BufferAttribute(arr, 3)); }
      for (var j = 0; j < N; j++) { var r = 6 + Math.random() * 6, th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1); dust[j * 3] = r * Math.sin(ph) * Math.cos(th); dust[j * 3 + 1] = r * Math.sin(ph) * Math.sin(th); dust[j * 3 + 2] = r * Math.cos(ph); rnd[j] = Math.random(); }
      geo.setAttribute('position', new T.BufferAttribute(first, 3));
      geo.setAttribute('aDust', new T.BufferAttribute(dust, 3));
      geo.setAttribute('aR', new T.BufferAttribute(rnd, 1));
      var vs = [
        'attribute vec3 aP0;attribute vec3 aP1;attribute vec3 aP2;attribute vec3 aP3;attribute vec3 aP4;attribute vec3 aP5;attribute vec3 aDust;attribute float aR;',
        'uniform float uM;uniform float uT;uniform float uIntro;uniform float uDisp;uniform float uSize;uniform float uPix;uniform vec3 uMouse;uniform float uMOn;',
        'varying vec3 vC;varying float vA;',
        'vec3 sh(float k){if(k<.5)return aP0;if(k<1.5)return aP1;if(k<2.5)return aP2;if(k<3.5)return aP3;if(k<4.5)return aP4;return aP5;}',
        'void main(){',
        ' float m=clamp(uM,0.,5.);float i0=floor(m);float f=m-i0;',
        ' float g=clamp((f-aR*.35)/.65,0.,1.);g=g*g*(3.-2.*g);',
        ' vec3 p=mix(sh(i0),sh(min(i0+1.,5.)),g);',
        ' float burst=sin(g*3.14159)*(1.2+uDisp*1.5);',
        ' vec3 n=vec3(sin(aR*91.7+uT*.7),cos(aR*57.3+uT*.9),sin(aR*33.1-uT*.6));',
        ' p+=n*burst*.55+n*.025*sin(uT*1.5+aR*20.);',
        ' p=mix(aDust,p,uIntro);',
        ' vec4 wp=modelMatrix*vec4(p,1.);',
        ' vec2 d=wp.xy-uMouse.xy;float dl=length(d);wp.xy+=normalize(d+1e-4)*uMOn*.55*smoothstep(1.1,0.,dl);',
        ' vec4 mv=viewMatrix*wp;gl_Position=projectionMatrix*mv;',
        ' gl_PointSize=uSize*uPix*(.55+aR*.9)/(-mv.z);',
        ' vec3 c1=vec3(.227,.388,.82);vec3 c2=vec3(.722,.8,1.);vec3 c3=vec3(.933,.949,.988);vec3 c4=vec3(.169,.31,.71);',
        ' float t=fract(aR*7.13);vC=t<.35?c1:t<.7?c2:t<.88?c3:c4;',
        ' vA=.55+.45*sin(uT*2.+aR*40.);',
        '}'
      ].join('\n');
      var fs = 'varying vec3 vC;varying float vA;void main(){vec2 q=gl_PointCoord-.5;float d=length(q);float a=smoothstep(.5,.05,d);gl_FragColor=vec4(vC*(.75+.6*smoothstep(.25,0.,d)),a*vA);}';
      var mat = new T.ShaderMaterial({ vertexShader: vs, fragmentShader: fs, transparent: true, depthWrite: false, blending: T.AdditiveBlending,
        uniforms: { uM: { value: cur.m }, uT: { value: 0 }, uIntro: { value: 0 }, uDisp: { value: 0 }, uSize: { value: mob ? 30 : 26 }, uPix: { value: 1 }, uMouse: { value: new T.Vector3(99, 99, 0) }, uMOn: { value: 0 } } });
      var pts = new T.Points(geo, mat); pts.frustumCulled = false;
      var group = new T.Group(); group.add(pts); scene.add(group);
      var DN = mob ? 300 : 900, dp = new Float32Array(DN * 3);
      for (var k = 0; k < DN; k++) { dp[k * 3] = (Math.random() - .5) * 22; dp[k * 3 + 1] = (Math.random() - .5) * 14; dp[k * 3 + 2] = -4 - Math.random() * 8; }
      var dg = new T.BufferGeometry(); dg.setAttribute('position', new T.BufferAttribute(dp, 3));
      var far = new T.Points(dg, new T.PointsMaterial({ color: 0xB8CCFF, size: .035, transparent: true, opacity: .55, depthWrite: false }));
      scene.add(far);
      var resize = function () {
        var w = window.innerWidth, h = VH(), pr = Math.min(window.devicePixelRatio || 1, isDesk() ? 1.75 : 1.5);
        renderer.setPixelRatio(pr); mat.uniforms.uPix.value = pr * (h / 900);
        renderer.setSize(w, h, false); cam.aspect = w / h; cam.fov = w < 760 ? 52 : (w <= 1024 ? 44 : 35); cam.updateProjectionMatrix();
      };
      resize(); window.addEventListener('resize', resize);
      var clock = new T.Clock(), ang = 0, last = 0, mv = new T.Vector3(), frames = 0, t0 = performance.now(), tuned = false;
      (function loop() {
        requestAnimationFrame(loop);
        if (document.hidden) return;
        var t = clock.getElapsedTime(), dt = Math.min(.05, t - last); last = t;
        if (!tuned) { frames++; var el = performance.now() - t0; if (el > 2500) { if (frames / (el / 1000) < 34) { renderer.setPixelRatio(1); mat.uniforms.uPix.value = VH() / 900; geo.setDrawRange(0, Math.floor(N * .55)); } tuned = true; } }
        cur.x += (tgt.x - cur.x) * .06; cur.y += (tgt.y - cur.y) * .06; cur.s += (tgt.s - cur.s) * .06; cur.m += (tgt.m - cur.m) * .045;
        vel *= .92;
        mat.uniforms.uT.value = t; mat.uniforms.uM.value = cur.m; mat.uniforms.uDisp.value = vel;
        mat.uniforms.uIntro.value = Math.min(1, mat.uniforms.uIntro.value + dt * .45);
        var spin = Math.max(0, 1 - Math.min(Math.abs(cur.m), Math.abs(cur.m - 4)) * 1.5);
        ang += dt * .3 * spin;
        if (spin < .4) ang += (Math.round(ang / (Math.PI * 2)) * Math.PI * 2 - ang) * .05;
        group.position.set(cur.x, cur.y, 0); group.scale.setScalar(cur.s);
        group.rotation.y = ang + mouse.x * .3; group.rotation.x = -mouse.y * .18;
        if (mouse.on) { mv.set(mouse.x, mouse.y, .5).unproject(cam); mv.sub(cam.position).normalize(); var dd = -cam.position.z / mv.z; mat.uniforms.uMouse.value.copy(cam.position).add(mv.multiplyScalar(dd)); mat.uniforms.uMOn.value += (1 - mat.uniforms.uMOn.value) * .1; }
        far.rotation.y = t * .01; far.position.y = window.scrollY * .0008;
        renderer.render(scene, cam);
      })();
    } catch (err) {
      var fb = document.getElementById('fb'); if (fb) fb.hidden = false;
      if (canvas) canvas.style.display = 'none';
    }
  }

  /* ---------------- UI wiring ---------------- */
  function wire() {
    root.classList.add('js');

    // tabs (tech stack)
    document.querySelectorAll('[data-tabs]').forEach(function (group) {
      var btns = group.querySelectorAll('[data-tab]'), wrap = group.parentElement;
      btns.forEach(function (b) {
        b.addEventListener('click', function () {
          var i = b.getAttribute('data-tab');
          btns.forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', on); });
          wrap.querySelectorAll('[data-pane]').forEach(function (p) { p.hidden = p.getAttribute('data-pane') !== i; });
        });
      });
    });

    // FAQ accordion
    document.querySelectorAll('[data-faq]').forEach(function (list) {
      var qs = list.querySelectorAll('.q');
      qs.forEach(function (q) {
        q.querySelector('button').addEventListener('click', function () {
          var open = q.classList.contains('open');
          qs.forEach(function (o) { o.classList.remove('open'); o.querySelector('.ans').hidden = true; o.querySelector('button').setAttribute('aria-expanded', 'false'); });
          if (!open) { q.classList.add('open'); q.querySelector('.ans').hidden = false; q.querySelector('button').setAttribute('aria-expanded', 'true'); }
        });
      });
    });

    // mobile menu
    var burger = document.getElementById('burger'), menu = document.getElementById('mmenu');
    if (burger && menu) {
      var setMenu = function (open) {
        menu.hidden = !open; burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        burger.querySelector('.ic-x').style.display = open ? '' : 'none'; burger.querySelector('.ic-m').style.display = open ? 'none' : '';
        document.body.style.overflow = open ? 'hidden' : '';
      };
      burger.addEventListener('click', function () { setMenu(menu.hidden); });
      menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });
    }

    // chapter jump (desktop)
    document.querySelectorAll('[data-jump]').forEach(function (b) {
      b.addEventListener('click', function () {
        var i = +b.getAttribute('data-jump'), el = b.closest('[data-chap]'), H = VH();
        var top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: top + (el.offsetHeight - H) * (i / 4 + .05), behavior: 'smooth' });
      });
    });

    // pill groups (single select)
    document.querySelectorAll('[data-pills]').forEach(function (g) {
      var input = g.querySelector('input[type=hidden]');
      g.querySelectorAll('.pill').forEach(function (p) {
        p.addEventListener('click', function () {
          g.querySelectorAll('.pill').forEach(function (x) { x.classList.toggle('sel', x === p); x.setAttribute('aria-pressed', x === p); });
          if (input) input.value = p.textContent.trim();
        });
      });
    });

    // step-by-step enquiry (contact page)
    document.querySelectorAll('form[data-wizard]').forEach(function (form) {
      var steps = form.querySelectorAll('.wz-step'), N = steps.length, cur = 1;
      var goBtns = form.querySelectorAll('[data-wz-go]'), back = form.querySelector('[data-wz-back]');
      var lbl = form.querySelector('[data-wz-lbl]'), num = form.querySelector('[data-wz-n]');
      // option tiles, budget cards and timeline chips
      form.querySelectorAll('[data-choice]').forEach(function (g) {
        var input = form.querySelector('input[name=' + g.getAttribute('data-choice') + ']'), multi = g.hasAttribute('data-multi');
        g.querySelectorAll('[data-val]').forEach(function (b) {
          b.addEventListener('click', function () {
            if (multi) b.classList.toggle('sel');
            else {
              var was = b.classList.contains('sel');
              g.querySelectorAll('[data-val]').forEach(function (x) { x.classList.remove('sel'); });
              if (!was || g.getAttribute('data-choice') === 'budget') b.classList.add('sel');   // budget always keeps one choice
            }
            g.querySelectorAll('[data-val]').forEach(function (x) { x.setAttribute('aria-pressed', x.classList.contains('sel')); });
            input.value = Array.prototype.map.call(g.querySelectorAll('.sel'), function (x) { return x.getAttribute('data-val'); }).join(', ');
            var er = form.querySelector('[data-err=' + g.getAttribute('data-choice') + ']'); if (er) er.textContent = '';
          });
        });
      });
      var setErr = function (inp, msg) { var w = inp.closest('.fx'); if (!w) return; w.classList.toggle('err', !!msg); var e = w.querySelector('.fx-err'); if (e) e.textContent = msg || ''; };
      form.querySelectorAll('.fx input').forEach(function (inp) { inp.addEventListener('input', function () { setErr(inp, ''); }); });
      var check = function (n) {
        var step = steps[n - 1], bad = null;
        if (step.querySelector('[data-choice=project]') && !form.querySelector('input[name=project]').value) {
          form.querySelector('[data-err=project]').textContent = 'Please choose at least one option.'; return step.querySelector('.opt');
        }
        step.querySelectorAll('.fx input').forEach(function (inp) {
          var v = inp.value.trim(), msg = '';
          if (inp.required && v.length < 2) msg = 'This field is required.';
          else if (inp.type === 'tel' && v && v.replace(/\D/g, '').length < 10) msg = 'Enter a valid 10-digit phone number.';
          else if (inp.type === 'email' && v && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) msg = 'Enter a valid email address.';
          setErr(inp, msg); if (msg && !bad) bad = inp;
        });
        return bad;
      };
      var summary = function () {
        var box = form.querySelector('[data-sum]'); if (!box) return;
        var g = function (n) { return form.querySelector('input[name=' + n + ']').value; };
        var items = [['Project', g('project')], ['Budget', g('budget')], ['Start', g('timeline')], ['Name', g('name')]];
        box.innerHTML = items.filter(function (x) { return x[1]; }).map(function (x) { return '<span><em>' + x[0] + ':</em> ' + x[1].replace(/</g, '&lt;') + '</span>'; }).join('');
      };
      var show = function (n, dir) {
        cur = n;
        steps.forEach(function (st, i) { st.classList.toggle('on', i === n - 1); st.classList.toggle('back', dir < 0); });
        goBtns.forEach(function (b) { var k = +b.getAttribute('data-wz-go'); b.classList.toggle('on', k === n); b.classList.toggle('done', k < n); });
        if (back) back.hidden = n === 1;
        if (lbl) lbl.textContent = n === N ? 'Send enquiry' : 'Continue';
        if (num) num.textContent = n;
        if (n === N) summary();
        var top = form.getBoundingClientRect().top;
        if (top < 70 || top > window.innerHeight * .6) window.scrollTo({ top: window.scrollY + top - 100, behavior: 'smooth' });
      };
      form._wz = {
        cur: function () { return cur; }, N: N,
        next: function () { var bad = check(cur); if (bad) { bad.focus(); return; } show(cur + 1, 1); },
        stepOf: function (el) { return +el.closest('.wz-step').getAttribute('data-step'); },
        check: check, show: show
      };
      if (back) back.addEventListener('click', function () { if (cur > 1) show(cur - 1, -1); });
      goBtns.forEach(function (b) {
        b.addEventListener('click', function () {
          var k = +b.getAttribute('data-wz-go');
          if (k < cur) return show(k, -1);
          for (var i = cur; i < k; i++) { var bad = check(i); if (bad) { show(i, 1); bad.focus(); return; } }
          show(k, 1);
        });
      });
    });

    // forms
    document.querySelectorAll('form[data-form]').forEach(function (form) {
      // live validation styling
      var cb = form.querySelector('input[name=consent]');
      if (cb) cb.addEventListener('change', function () { cb.closest('.ef-ok').classList.remove('err'); });
      form.querySelectorAll('.fl input,.fl textarea').forEach(function (inp) {
        inp.addEventListener('input', function () { inp.closest('.fl').classList.remove('err'); });
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var bad = null, wz = form._wz;
        if (wz) {
          if (wz.cur() < wz.N) { wz.next(); return; }
          for (var si = 1; si <= wz.N; si++) { bad = wz.check(si); if (bad) { wz.show(si, -1); bad.focus(); return; } }
        }
        form.querySelectorAll('.fl input[required]').forEach(function (inp) {
          var v = inp.value.trim(), ok = v.length > 1;
          if (inp.type === 'tel') ok = v.replace(/\D/g, '').length >= 10;
          inp.closest('.fl').classList.toggle('err', !ok);
          if (!ok && !bad) bad = inp;
        });
        var em = form.querySelector('input[type=email]');
        if (em && em.value.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em.value.trim())) { em.closest('.fl').classList.add('err'); bad = bad || em; }
        var ok = form.querySelector('input[name=consent]');
        if (ok && !ok.checked) { ok.closest('.ef-ok').classList.add('err'); bad = bad || ok; }
        if (bad) { bad.focus(); return; }
        var btn = form.querySelector('[type=submit]'); if (btn) { btn.disabled = true; btn.classList.add('loading'); }
        var done = function () { form.hidden = true; var ok = form.parentElement.querySelector('[data-sent]'); if (ok) { ok.hidden = false; ok.scrollIntoView({ behavior: 'smooth', block: 'center' }); } };
        var hp = form.querySelector('.hp');
        if (hp && hp.value) { done(); return; }            // spam bot filled the hidden field
        if (!FORM_ENDPOINT) { console.warn('FORM_ENDPOINT is empty: enquiry not saved. See README.'); done(); return; }
        var data = new URLSearchParams(new FormData(form));
        data.delete('website');
        if (data.has('timeline')) { var tl = data.get('timeline'); data.delete('timeline'); if (tl) data.set('message', 'Start: ' + tl + (data.get('message') ? '\n\n' + data.get('message') : '')); }
        if (data.get('consent')) data.set('consent', 'Yes - agreed to Privacy Policy (' + location.origin + '/privacy.html)');
        data.append('page', document.title);
        data.append('pageUrl', location.href);
        data.append('submittedAt', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
        fetch(FORM_ENDPOINT, { method: 'POST', body: data, mode: 'no-cors' }).then(done).catch(function () { if (btn) { btn.disabled = false; btn.classList.remove('loading'); } alert('Sorry, we could not send your enquiry. Please message us on WhatsApp: +91 78716 55111'); });
      });
    });

    // hover-only effects (skipped on touch devices)
    if (canHover) {
      document.querySelectorAll('[data-mag]').forEach(function (t) {
        t.addEventListener('mousemove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--bx', ((e.clientX - r.left - r.width / 2) * .22).toFixed(1) + 'px'); t.style.setProperty('--by', ((e.clientY - r.top - r.height / 2) * .32).toFixed(1) + 'px'); });
        t.addEventListener('mouseleave', function () { t.style.setProperty('--bx', '0px'); t.style.setProperty('--by', '0px'); });
      });
      document.querySelectorAll('[data-tilt]').forEach(function (t) {
        t.addEventListener('mousemove', function (e) { var r = t.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height; t.style.setProperty('--ry', ((px - .5) * 5).toFixed(2) + 'deg'); t.style.setProperty('--rx', ((py - .5) * -5).toFixed(2) + 'deg'); t.style.setProperty('--gx', (px * 100).toFixed(1) + '%'); t.style.setProperty('--gy', (py * 100).toFixed(1) + '%'); });
        t.addEventListener('mouseleave', function () { t.style.setProperty('--rx', '0deg'); t.style.setProperty('--ry', '0deg'); });
      });
      document.querySelectorAll('.gc').forEach(function (t) {
        t.addEventListener('mousemove', function (e) { var r = t.getBoundingClientRect(); t.style.setProperty('--x', (e.clientX - r.left) + 'px'); t.style.setProperty('--y', (e.clientY - r.top) + 'px'); });
      });
      var nb = document.querySelector('.nbar');
      if (nb) nb.addEventListener('mousemove', function (e) { var r = nb.getBoundingClientRect(); nb.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%'); });
      window.addEventListener('mousemove', function (e) { mouse.x = e.clientX / window.innerWidth * 2 - 1; mouse.y = -(e.clientY / VH() * 2 - 1); mouse.on = true; }, { passive: true });
    }

    // year in footer
    document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  function start() {
    wire();
    var firstK = document.querySelector('[' + kAttr() + ']');
    if (firstK) { var v = readK(firstK); cur = { x: v[0], y: v[1], s: v[2], m: v[3] }; tgt = { x: v[0], y: v[1], s: v[2], m: v[3] }; }
    initGL();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function () {
      // only re-measure height when width changes, so the mobile address bar doesn't cause jumps
      if (window.innerWidth !== lastW) { lastW = window.innerWidth; root.style.setProperty('--vh', VH() + 'px'); }
      onScroll();
    });
    tick(); setTimeout(tick, 400);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
