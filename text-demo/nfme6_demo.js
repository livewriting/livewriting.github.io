

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
  /*  navigator.getUserMedia = (navigator.getUserMedia ||
                              navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia ||
                              navigator.msGetUserMedia);
*/
    // set up forked web audio context, for multiple browsers
    // window. is needed otherwise Safari explodes

    var context = new AudioContext();
    var audioBuffer;
    var sourceNode;
    var sourceNode2;
    var javascriptNode = context.createScriptProcessor(2048, 1, 1);
    var javascriptNode2 = context.createScriptProcessor(2048, 1, 1);
   // javascriptNode.connect(context.destination);

    analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 512;
    var amplitudeArray =  new Uint8Array(analyser.frequencyBinCount);

    analyser2 = context.createAnalyser();
    analyser2.smoothingTimeConstant = 0.3;
    analyser2.fftSize = 512;
    var amplitudeArray2 =  new Uint8Array(analyser2.frequencyBinCount);

    var drumBuffer;
    var harpBuffer;
    var vol_average = 0;
    
  /*  if (navigator.getUserMedia) {
        console.log('getUserMedia supported.');
        navigator.getUserMedia (
            // constraints - only audio needed for this app
            {
                audio: true
            },

      // Success callback
            function(stream) {
                source =  context.createMediaStreamSource(stream);
                source.connect(analyser2);
             //   analyser.connect(context.destination);
            },

      // Error callback
      function(err) {
         console.log('The following gUM error occured: ' + err);
      }
   );
} else {
   console.log('getUserMedia not supported on your browser!');
}*/
    

    // load the sound
    var toggle = false;
//   loadSound("01-Come_Together.mp3");
    $("#playstop").button().click(function(){
        if (toggle){
            stopSound();
            $(this).button('option', 'label', 'Play');
        }
        else{
            loadSound();
            $(this).button('option', 'label', 'Stop');
        }
        toggle = !toggle;

    });
    init();
    
    function setupAudioNodes() {
 
        // setup a javascript node
        // connect to destination, else it isn't called
 
        // setup a analyzer
       
 
        // create a buffer source node
        sourceNode = context.createBufferSource();
        sourceNode.buffer = drumBuffer;
        sourceNode2 = context.createBufferSource();
        sourceNode2.buffer = harpBuffer;
        // connect the source to the analyser
        sourceNode.connect(analyser);
        sourceNode2.connect(analyser2);
        sourceNode.loop = true;
   //     sourceNode2.loop = true;
        // we use the javascript node to draw at a specific interval.
        analyser.connect(javascriptNode);
        analyser2.connect(javascriptNode2);
        
        javascriptNode.connect(context.destination);
        javascriptNode2.connect(context.destination);
        // and connect to destination, if you want audio
        sourceNode.connect(context.destination);
        sourceNode2.connect(context.destination);
    }

    // load the specified sound
    function loadSound() {
        var request = new XMLHttpRequest();
        request.open('GET', "drums_2.mp3", true);
        request.responseType = 'arraybuffer';
var i=0;
        // When loaded decode the data
        request.onload = function() {

            // decode the data
            context.decodeAudioData(request.response, function(buffer) {
                drumBuffer = buffer;
                i++;
                if (i==2){

                // when the audio is decoded play the sound
                    playSound();
                }
            }, onError);
        }
        request.send();
        
        var request2 = new XMLHttpRequest();
        request2.open('GET', "harps_fadeio.mp3", true);
        request2.responseType = 'arraybuffer';

        // When loaded decode the data
        request2.onload = function() {

            // decode the data
            context.decodeAudioData(request2.response, function(buffer) {
                harpBuffer = buffer;

                // when the audio is decoded play the sound
                i++;
                if (i==2){

                // when the audio is decoded play the sound
                    playSound();
                }
            }, onError);
        }
        request2.send();
    }


    function playSound() {
        setupAudioNodes();

        sourceNode2.start(0);
        sourceNode.start(0);
     //   sourceNode.loop = true;
    }
    
    function stopSound() {
        sourceNode.stop(0);
        sourceNode2.stop(0);

  //      sourceNode.noteOff(0);
    }
    
    // log if an error occurs
    function onError(e) {
        console.log(e);
    }

    javascriptNode.onaudioprocess = function() {

        // get the average, bincount is fftsize / 2
        analyser.getByteTimeDomainData(amplitudeArray);
     //   console.log(vol_average);
     //   requestFrame
    } 
    
     javascriptNode2.onaudioprocess = function() {

        // get the average, bincount is fftsize / 2
        analyser2.getByteTimeDomainData(amplitudeArray2);
     //   console.log(vol_average);
     //   requestFrame
    } 

    function getAverageVolume(array) {
        var values = 0;
        var average;

        var length = array.length;

        // get all the frequency amplitudes
        for (var i = 0; i < length; i++) {
            values += array[i];
        }

        average = values / length;
        return average;
    }
    
    
    function init(){
        var renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setClearColor( 0xffffff );
        $("#container").append(renderer.domElement);
       // FIME (Text vIsualization for Musical Expression
        //var BOOK="Hello, NIME. This is fft spectrum testing. Make sure you allow to use the microphone. Sing some notes. The frequency of the note will change the height of the text.\n\n\n\nHello, NIME. This is fft spectrum testing. Make sure you allow to use the microphone. Sing some notes. The frequency of the note will change the height of the text.";
        var BOOK="a  = merge (pattern(b.h.f,h.h.fp,e.q.p,b.q.fff,s.w), pattern2);\nreverb = new Reverb(\"tunnel\", 0.5, 0.2);\nfilter = new BiQuad(0.99, 0.05, 1);\na => reverb => filter => out;\na.loop();\n\nb = loadSample(\"sample1.wav\", \"sync\", bpm);\nreverb2 = new Reverb(\"cave\", 0.5, 0.2);\nsine = new LFO(\"sine\", 8);\nb => reverb2 => out;\nsine.out =>  b.level;b.play();\n\n\n\\\\Press Play button below to start.";
        var fontSize = 32;
        var lettersPerSide = 16;
       
        var tex = getKeyTabular(fontSize,"Monospace",lettersPerSide);
        
        tex.flipY = false;
        tex.needsUpdate = true;

        var mat = new THREE.MeshBasicMaterial({map: tex});
        mat.transparent = true;

        var camera = new THREE.PerspectiveCamera(45,1,4,40000);
        camera.setLens(35);

        window.onresize2 = function() {
            renderer.setSize($("#container").width(),window.innerHeight-50);
            camera.aspect = $("#container").width()/ (window.innerHeight-50);
            camera.updateProjectionMatrix();
        };
        window.onresize2();

        var radius = 60;

        var scene = new THREE.Scene();
        camera.position.z = radius;
        scene.add(camera);
        
        var geo = new THREE.Geometry();
        var str = BOOK;

        var j=0, ln=0;
        var scaleX = 0.7, scaleY = 1.9;
      //  var scaleX = 5, scaleY = 12;

        var rightMostPosition = 0;
        var rightMostXCoord = -10000;
        var letterPerLine = 70;
        var offset = 1.0;
    //    var offset = 8.0;
        var attributes = {
            strIndex: {type: 'f', value: [] }
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
            var vcenterX = j;
            var vcenterY = (ln*scaleY*2.0+offset) / 2.0;
            for (var k=0; k<4;k++){
                attributes.strIndex.value[i*4+k] = i;// THREE.Vector2(6.0,12.0);
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
                    rightMostXCoord = j*scaleX+offset;
                    rightMostPosition = j;
                }
            }
        }
        rightMostXCoord = (rightMostPosition+1) * scaleX;
        var centerX = (rightMostPosition+1) * scaleX / 2.0;
        var centerY = ( (ln-1) * scaleY )/2.0
      //  console.log("length:" + attributes.attCenter.value.length);
    /*    for (var k=0; k<attributes.attCenter.value.length;k++){
            attributes.attCenter.value[k].x -=centerX;
            attributes.attCenter.value[k].y -=centerY;
        }
      */  
        var top = new THREE.Object3D();

        var width = $("#container").width(),
            height = window.innerHeight;

        
        
        var uniforms = {
            timeDomain : { type:"fv1", value:new Float32Array(512)},
            timeDomain2 : { type:"fv1", value:new Float32Array(512)},
        //    center : { type: "v2", value: new THREE.Vector2(centerX,centerY) },
            map : { type: "t", value: tex },
            rightMostXCoord : { type: "f", value: 0.0 },
          //  xCoord : { type: "f", value: 0.0 }
        };

        uniforms.rightMostXCoord.value = rightMostXCoord;
        
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
            
  
          /*  var array =  new Uint8Array(analyser.fftSize);
            analyser.getByteTimeDomainData(array);
            //vol_average = getAverageVolume(array)
   //         uniforms.volume.value = vol_average;
            //array.length = 20;
        */     var alpha = 0.5 ;
           
            for (var l=0;l<512;l++){
                uniforms.timeDomain.value[l] = uniforms.timeDomain.value[l] * alpha + (1-alpha ) * (amplitudeArray[l]/256.0-0.5); 
                uniforms.timeDomain2.value[l] = uniforms.timeDomain2.value[l] * alpha + (1-alpha ) * (amplitudeArray2[l]/256.0-0.5); 
            }
               // uniforms.timeDomain.value[l] = amplitudeArray[l]/256.0-0.5; 
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
         //   uniforms.volume.value = vol_average/128.0;
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
