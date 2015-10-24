(function() {
  // Window.
  var windowWidth = window.innerWidth,
      windowHeight = window.innerHeight;

  // Mouse.
  var mouseX = 0,
      mouseY = 0;

  // Audio.
  var audio,
      audioContext,
      audioAnalyser,
      audioBuffer,
      audioSource,
      audioFrequency,
      request;

  function initAudio() {
    audio = new Audio();
    audio.crossOrigin = 'anonymous';

    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    audioSource = audioContext.createMediaElementSource(audio);
    audioSource.connect(audioContext.destination);

    audioAnalyser = audioContext.createAnalyser();
    audioAnalyser.smoothingTimeConstant = 0.1;
    audioAnalyser.fftSize = 512 * 4;

    audioSource.connect(audioAnalyser);

    request = new XMLHttpRequest();

    request.onreadystatechange = function() {
      if (request.readyState === 4 && request.status === 200) {
          var information = JSON.parse(request.responseText);

          audio.src = information.stream_url + '?client_id=78c6552c14b382e23be3bce2fc411a82';
          audio.play();

          var music = document.createElement('a');

          music.setAttribute('href', information.permalink_url);
          music.innerHTML = '<img src="https://developers.soundcloud.com/assets/logo_white.png">' + information.title + ' - ' + information.user.username;

          document.body.appendChild(music);
      }
    };

    request.open('GET', 'http://api.soundcloud.com/resolve.json?url=https://soundcloud.com/theblackkeys/gold-on-the-ceiling&client_id=78c6552c14b382e23be3bce2fc411a82', true);

    request.send();

    audioAnalyser.connect(audioContext.destination);

    audioFrequency = new Uint8Array(audioAnalyser.frequencyBinCount);

    audio.addEventListener('ended', function() {
      audio.play();
    });
  }

  //Scene.
  var scene,
      camera,
      renderer,
      light,
      composer,
      circle,
      triangle,
      triangleSleeve,
      triangleLength = 100,
      effectOne,
      effectTwo;

  function initScene() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, windowWidth / windowHeight, 0.1, 1000);
    camera.position.z = 250;

    scene.add(camera);

    renderer = new THREE.WebGLRenderer();

    renderer.setClearColor(0xFFFFFF, 0)
    renderer.setSize(windowWidth, windowHeight);

    light = new THREE.DirectionalLight(0xFFFFFF, 1);
    light.position.set(1, 1, 1);

    scene.add(light);

    light = new THREE.DirectionalLight(0xFFFFFF, 1);
    light.position.set(-1, -1, 1);

    scene.add(light);

    circle = new THREE.Object3D();

    triangle = [];
    triangleSleeve = [];

    for (var i = 0; i < triangleLength; i++) {
      triangle[i] = new THREE.Mesh(
        new THREE.TetrahedronGeometry(45, 0),
        new THREE.MeshPhongMaterial({
          color: 0xFFFFFF
        })
      );

      triangle[i].position.y = 100;

      triangleSleeve[i] = new THREE.Object3D();
      triangleSleeve[i].add(triangle[i]);
      triangleSleeve[i].rotation.z = i * (360 / triangleLength) * Math.PI / 180;

      circle.add(triangleSleeve[i]);
    }

    scene.add(circle);

    composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));

    effectOne = new THREE.ShaderPass(THREE.DotScreenShader);
    effectOne.uniforms['scale'].value = 5;
    composer.addPass(effectOne);

    effectTwo = new THREE.ShaderPass(THREE.RGBShiftShader);
    effectTwo.uniforms['amount'].value = 0.005;
    effectTwo.renderToScreen = true;
    composer.addPass(effectTwo);

    renderer.render(scene, camera);

    document.body.appendChild(renderer.domElement);
  }

  //Render.
  function render() {
    for (var i = 0; i < triangleLength; i++) {
      triangle[i].scale.z = ((audioFrequency[i] / 256) * 2.5) + 0.01;
    }

    circle.rotation.z += 0.01;

    renderer.render(scene, camera);

    TweenLite.to(effectTwo.uniforms['amount'], 1, {
      value: mouseX / 2500
    });

    composer.render();

    audioAnalyser.getByteFrequencyData(audioFrequency);

    requestAnimationFrame(render);
  }

  // Window.
  window.addEventListener('resize', function() {
    windowHeight = window.innerHeight;
    windowWidth = window.innerWidth;

    camera.aspect = windowWidth / windowHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(windowWidth, windowHeight);
  });

  window.addEventListener('mousewheel', function(e) {
    var volume = Math.round(audio.volume * 100) / 100;

      if (e.wheelDelta < 0 && volume - 0.05 >= 0) {
          volume = Math.abs(volume - 0.05);
      } else if (e.wheelDelta > 0 && volume + 0.05 <= 1) {
          volume = Math.abs(volume + 0.05);
      }

      audio.volume = volume;
  });

  window.addEventListener('mousemove', function(e) {
    mouseX = e.clientX - windowWidth / 2;
    mouseY = e.clientY - windowHeight / 2;
  });

  //Init.
  initAudio();
  initScene();
  render();
})();
