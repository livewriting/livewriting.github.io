window.onload = function() {
var DEBUG = false;    
    
    // create the audio context (chrome only for now)
    // create the audio context (chrome only for now)
    if (! window.AudioContext) {
        if (! window.webkitAudioContext) {
            alert('no audiocontext found');
        }
        window.AudioContext = window.webkitAudioContext;
    }
    
    if (!hasGetUserMedia()) {
        alert('getUserMedia() is not supported in your browser. Please visit http://caniuse.com/#feat=stream to see web browsers available for this demo.');
    }
    
    navigator.getUserMedia = (navigator.getUserMedia ||
                              navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia ||
                              navigator.msGetUserMedia);
    

    // set up forked web audio context, for multiple browsers
    // window. is needed otherwise Safari explodes

    var context = new AudioContext();
    var audioBuffer;
    var sourceNode;
   // var javascriptNode = context.createScriptProcessor(2048, 1, 1);
//    javascriptNode.connect(context.destination);
    analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 512;
    var drumBuffer;
    var vol_average = 0;
    
    if (navigator.getUserMedia) {
        console.log('getUserMedia supported.');
        navigator.getUserMedia (
            // constraints - only audio needed for this app
            {
                audio: true
            },

      // Success callback
            function(stream) {
                source =  context.createMediaStreamSource(stream);
                source.connect(analyser);
             //   analyser.connect(context.destination);
            },

      // Error callback
      function(err) {
         console.log('The following gUM error occured: ' + err);
      }
   );
} else {
   console.log('getUserMedia not supported on your browser!');
}

    // load the sound
    
//   loadSound("01-Come_Together.mp3");
   // loadSound("drums.mp3");
    init();
    
    function setupAudioNodes() {
 
        // setup a javascript node
        // connect to destination, else it isn't called
 
        // setup a analyzer
       
 
        // create a buffer source node
        sourceNode = context.createBufferSource();
        sourceNode.buffer = drumBuffer;

        // connect the source to the analyser
        sourceNode.connect(analyser);
 
        // we use the javascript node to draw at a specific interval.
     //   analyser.connect(javascriptNode);
        
        // and connect to destination, if you want audio
        sourceNode.connect(context.destination);
    }

    // load the specified sound
    function loadSound(url) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        // When loaded decode the data
        request.onload = function() {

            // decode the data
            context.decodeAudioData(request.response, function(buffer) {
                drumBuffer = buffer;

                // when the audio is decoded play the sound
                playSound();
            }, onError);
        }
        request.send();
    }


    function playSound() {
        setupAudioNodes();

        sourceNode.start(0);
     //   sourceNode.loop = true;
    }
    
    function stopSound() {
        sourceNode.stop(0);
  //      sourceNode.noteOff(0);
    }
    
    // log if an error occurs
    function onError(e) {
        console.log(e);
    }
    
 /*   javascriptNode.onaudioprocess = function() {

        // get the average, bincount is fftsize / 2
        var array =  new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        vol_average = getAverageVolume(array)
     //   console.log(vol_average);

    }    
*/
    function getAverageVolume(array) {
        var values = 0;
        var average;
        var weightedAverageIndex = 0;
        var length = array.length;

        // get all the frequency amplitudes
        for (var i = 0; i < length; i++) {
            values += array[i];
            weightedAverageIndex += array[i] * i;
        }
        if ( values > 0 )weightedAverageIndex /= values;
        average = values / length;
        return [average, weightedAverageIndex];
    }
    
    
    function init(){
        var renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setClearColor( 0xffffff );
        document.body.appendChild(renderer.domElement);
       // FIME (Text vIsualization for Musical Expression
      //  var BOOK="Hello, NIME.";//. This is fft spectrum testing. Make sure you allow to use the microphone. Sing some notes. The frequency of the note will change the height of the text.";
         var BOOK="This is sine-wave convoluted text.\nMake sure you \"Allow\" for\nmicrophone permissions in your web browser.";
     //   var BOOK="H";
        var fontSize = 64;
        var lettersPerSide = 16;
       
        var tex = getKeyTabular(fontSize,"Monospace",lettersPerSide);
        
        tex.flipY = false;
        tex.needsUpdate = true;

        var mat = new THREE.MeshBasicMaterial({map: tex});
        mat.transparent = true;

        var camera = new THREE.PerspectiveCamera(45,1,4,40000);
        camera.setLens(35);

        window.onresize = function() {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        };
        window.onresize();

        var radius = 60;

        var scene = new THREE.Scene();
        camera.position.z = radius;
        scene.add(camera);
        
        var geo = new THREE.Geometry();
        var str = BOOK;

        var j=0, ln=0;
     //   var scaleX = 0.7, scaleY = 1.9;
        var scaleX = 1.5, scaleY = 4;

        var rightMostPosition = 0;
        var letterPerLine = 60;
    //    var offset = 1.0;
        var offset = 2.5;
        var attributes = {
            attCenter: {type: 'f', value: [] },
            attCenterx: {type: 'f', value: [] }
        };

        for (i=0; i<str.length; i++) {
            var code = str.charCodeAt(i);
            var cx = code % lettersPerSide;
            var cy = Math.floor(code / lettersPerSide);
            
            geo.vertices.push(
                new THREE.Vector3( j*scaleX, ln*scaleY, 0 ),
                new THREE.Vector3( j*scaleX+offset, ln*scaleY, 0 ),
                new THREE.Vector3( j*scaleX+offset, ln*scaleY+offset, 0 ),
                new THREE.Vector3( j*scaleX, ln*scaleY+offset, 0 )
            );
            var vcenterX = (j*scaleX*2.0+offset) / 2.0;;
            var vcenterY = (ln*scaleY*2.0+offset) / 2.0;
            for (var k=0; k<4;k++){
                attributes.attCenter.value[i*4+k] = vcenterY;// THREE.Vector2(6.0,12.0);
                attributes.attCenterx.value[i*4+k] = vcenterX;// THREE.Vector2(6.0,12.0);
            }
            var face = new THREE.Face3(i*4+0, i*4+1, i*4+2);
            geo.faces.push(face);
            face = new THREE.Face3(i*4+0, i*4+2, i*4+3);
            geo.faces.push(face);
            var ox=(cx)/lettersPerSide, oy=(cy+0.05)/lettersPerSide, off=0.9/lettersPerSide;
          //  var sz = lettersPerSide*fontSize;
            geo.faceVertexUvs[0].push([
                new THREE.Vector2( ox, oy+off ),
                new THREE.Vector2( ox+off, oy+off ),
                new THREE.Vector2( ox+off, oy )
            ]);
            geo.faceVertexUvs[0].push([
                new THREE.Vector2( ox, oy+off ),
                new THREE.Vector2( ox+off, oy ),
                new THREE.Vector2( ox, oy )
            ]);
            
            if (code == 10 || j  == letterPerLine) {
                ln--;
                j=0;
            } else {
                j++;
                if (rightMostPosition<j){
                    rightMostPosition = j;
                }
            }
        }
        var centerX = (rightMostPosition+1) * scaleX / 2.0;
        var centerY = ( (ln-1) * scaleY )/2.0
     //   console.log("length:" + attributes.attCenter.value.length);
    /*    for (var k=0; k<attributes.attCenter.value.length;k++){
            attributes.attCenter.value[k].x -=centerX;
            attributes.attCenter.value[k].y -=centerY;
        }
      */  
        var top = new THREE.Object3D();

        var width = window.innerWidth,
            height = window.innerHeight;

        
        
        var uniforms = {
            freqBin : { type:"fv1", value:new Float32Array(80)},
        //    center : { type: "v2", value: new THREE.Vector2(centerX,centerY) },
            map : { type: "t", value: tex },
            volume : { type: "f", value: 0.0 },
            avg_index : {type : "f", value:0.0},
            time : { type: "f", value: 0.0 }
        };

        var shaderMaterial = new THREE.ShaderMaterial({
            uniforms : uniforms,
            attributes : attributes,
            vertexShader : document.querySelector('#vertex').textContent,
            fragmentShader : document.querySelector('#fragment').textContent
        });
        shaderMaterial.transparent = true;
        shaderMaterial.depthTest = false;

        var w = 80 * 1.0;
        var r = w * 1/2 * 1/Math.PI ;
//var material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );

        var book = new THREE.Mesh(
            geo,
            shaderMaterial
        //    material
        );

        book.doubleSided = true;

        var a = Math.PI/2;
        book.position.x -= centerX;
        book.position.y -= centerY;
        book.position.z = 0;
        top.add(book);

        scene.add(top);
       
       
    //    camera.position.y = 40;
        camera.lookAt(scene.position);
     /*   var sp1 = WX.SP1({ ampSustain: 1.0 });

        sp1.to(WX.Master);

        sp1.onReady = function () {
            sp1.noteOn(60, 100);
        };
        sp1.loadClip({
            name: 'drums',
            url: './drums.mp3'
        });*/
      //  scene.add(geo);
        var animate = function(t) {
        //    if ( toggle ) 
          //      uniforms.time.value += 1.0/500.0;
            
  
            var array =  new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            var analyzedArray = getAverageVolume(array);
            vol_average = analyzedArray[0];
            var avg_index = analyzedArray[1];
          //  console.log("avg_index:" + avg_index);
            var index = (avg_index) / 90.0;
            Math.min(Math.max(index, 0.0), 1.0);
            uniforms.avg_index.value = index;
            uniforms.volume.value = vol_average/256.0;
            //array.length = 20;
            var alpha = 0.92 ;
            
      /*      for (var l=0;l<100;l++)
                uniforms.freqBin.value[l] = uniforms.freqBin.value[l] * alpha + (1-alpha ) * array[l]; 
        */        
        /*    var maxindex = -1;
            var maxValue = 0;
            for (var l=0;l<50;l++){
                if(maxValue < array[l])
                {
                    maxindex = l;
                    maxValue = array[l]
                }
                uniforms.freqBin.value[l] = uniforms.freqBin.value[l] * alpha; 


            }
         uniforms.freqBin.value[maxindex] = uniforms.freqBin.value[maxindex] * alpha + (1-alpha ) * maxValue; 
*/
            uniforms.volume.value = vol_average/128.0;
        //    console.log( uniforms.volume.value);
            renderer.render(scene, camera);
            requestAnimationFrame(animate, renderer.domElement);
        };
        animate(Date.now());
      //  document.body.appendChild(c);
        var down = false;
        var sx = 0, sy = 0;
        var toggle = true;
        window.onmousedown = function (ev){
           if (ev.target == renderer.domElement) {
                down = true;
                sx = ev.clientX;
                sy = ev.clientY;
           }
          /* if (toggle)
                stopSound();
           else
                playSound();
           toggle = !toggle;
           //  console.log(sp1.val());
*/
        };
        window.onmouseup = function(){ down = false; };
        window.onmousemove = function(ev) {
            if (down) {
                var dx = ev.clientX - sx;
                var dy = ev.clientY - sy;
                book.rotation.x += dy/50.0;
                book.rotation.y += dx/50.0;
     //           camera.rotation.y += dx/500 * (camera.fov/45);;
    //            camera.rotation.x += dy/500 * (camera.fov/45);
                sx += dx;
                sy += dy;
            }
        };
    }
    

        

       // MUI.buildControls(cmp1, 'rack');

    
};
