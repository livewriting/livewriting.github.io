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

    var context = new AudioContext();
    var audioBuffer;
    var sourceNode;
    var startTime;
  //  var javascriptNode = context.createScriptProcessor(2048, 1, 1);
//    javascriptNode.connect(context.destination);
    analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 512;
    var drumBuffer;
    var vol_average = 0;
    var toggle = false;
    var nextTickTime = 0;
    var karaokeData;
    var karaokeIndex = 0;
    var uniforms;
    // load the sound
    $("#playstop").button().click(function(){
        if (toggle){
            karaokeIndex = 0;
            stopSound();
            $(this).button('option', 'label', 'Play');
            toggle = !toggle;
        }
        else{
            karaokeIndex = 0;
            uniforms.startIndex.value = karaokeData[karaokeIndex]["str_index"];
            uniforms.endIndex.value = karaokeData[karaokeIndex]["str_index"];
            nextTickTime = karaokeData[karaokeIndex]["timestamp"];
            loadSound("comtogether.cut.mp3");
            $(this).button('option', 'label', 'Stop');
        }
        
    });
    
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
    //    analyser.connect(javascriptNode);
        
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
        startTime = (new Date()).getTime();
     //   sourceNode.loop = true;
                toggle = !toggle;

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
        $("#container").append(renderer.domElement);
       // FIME (Text vIsualization for Musical Expression
        var BOOK="Here come old flattop, he come grooving up slowly\nHe got joo-joo eyeball, he one holy roller\nHe got hair down to his knee\nGot to be a joker he just do what he please\n\nHe wear no shoeshine, he got toe-jam football\nHe got monkey finger, he shoot coca-cola\nHe say \"I know you, you know me\"\nOne thing I can tell you is you got to be free\nCome together right now over me\n\nHe bag production, he got walrus gumboot\nHe got Ono sideboard, he one spinal cracker\nHe got feet down below his knee\nHold you in his armchair you can feel his disease\nCome together right now over me\n\nHe roller-coaster, he got early warning\nHe got muddy water, he one mojo filter\nHe say \"One and one and one is three\"\nGot to be good-looking cos he's so hard to see\nCome together right now over me\n";
        var fontSize = 32;
        var lettersPerSide = 16;
        
    //    var nextTickTime;
     //   var karaokeIndex=0;
        $.getJSON( "comtogether.json", function( data ) {
            karaokeData = data;
            nextTickTime = karaokeData[karaokeIndex]["timestamp"];
        });

       
        
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
        camera.position.z = radius*1.3;
        scene.add(camera);
        
        var geo = new THREE.Geometry();
        var str = BOOK;

        var j=0, ln=0;
        var scaleX = 0.8, scaleY = 1.9;
        var rightMostPosition = 0;
        var offset = 1.1;
        
        var attributes = {

				strindex: {	type: 'f', value: [] }

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
            var face = new THREE.Face3(i*4+0, i*4+1, i*4+2);
            geo.faces.push(face);
            face = new THREE.Face3(i*4+0, i*4+2, i*4+3);
            geo.faces.push(face);
            for (var k=0; k<4;k++){
                attributes.strindex.value[i*4+k] = i;
            }
                    
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
            
            if (code == 10) {
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
        
        var top = new THREE.Object3D();

        var width = $("#container").width(),
            height = window.innerHeight-50;

        uniforms = {
            center : { type: "v2", value: new THREE.Vector2(centerX,centerY) },
            startIndex : { type: "f", value: 0.0  },
            endIndex : { type: "f", value: 0.0  },
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

        var book = new THREE.Mesh(
            geo,
            shaderMaterial
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
            uniforms.time.value += 0.05;
            var currentTime = (new Date()).getTime() - startTime+100;
           
            if (toggle && currentTime > nextTickTime && karaokeIndex < karaokeData.length-1){
                uniforms.time.value=0;
                karaokeIndex++;
                nextTickTime = karaokeData[karaokeIndex]["timestamp"];
                uniforms.startIndex.value = karaokeData[karaokeIndex-1]["str_index"];
                uniforms.endIndex.value = karaokeData[karaokeIndex]["str_index"];
                console.log("index:" + karaokeIndex + " start:" + uniforms.startIndex.value + " end:" + uniforms.endIndex.value + "toggle:" + toggle);
            }
            var array =  new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            var analyzedArray = getAverageVolume(array);
            vol_average = analyzedArray[0];
            var avg_index = analyzedArray[1];
          //  console.log("avg_index:" + avg_index);
            var index = (avg_index - 32.0) / 10.0;
            index = Math.min(Math.max(index, 0.0), 1.0);
            uniforms.avg_index.value = index;
            uniforms.volume.value = vol_average/128.0;
            renderer.render(scene, camera);
            requestAnimationFrame(animate, renderer.domElement);
        };
        animate(Date.now());
      //  document.body.appendChild(c);
        var down = false;
        var sx = 0, sy = 0;
        window.onmousedown = function (ev){
            if (ev.target == renderer.domElement) {
                down = true;
                sx = ev.clientX;
                sy = ev.clientY;
            }
   /*        if (toggle)
                stopSound();
            else
                playSound();
            toggle = !toggle;
          
     */       //  console.log(sp1.val());

        };
        window.onmouseup = function(){ down = false; };
        window.onmousemove = function(ev) {
            if (down) {
                var dx = ev.clientX - sx;
                var dy = ev.clientY - sy;
                book.rotation.x += dy/50.0;
                book.rotation.y += dx/50.0;
                sx += dx;
                sy += dy;
            }
        };
    }
    
};
