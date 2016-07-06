

window.onload = function() {
var DEBUG = false;    
    
   var  randomcolor = [ "#c0c0f0", "#f0c0c0", "#c0f0c0", "#f090f0", "#90f0f0", "#f0f090"],
       keyup_debug_color_index=0,
        keydown_debug_color_index=0,
        keypress_debug_color_index=0;
        
    // create the audio context (chrome only for now)
    // create the audio context (chrome only for now)
    if (! window.AudioContext) {
        if (! window.webkitAudioContext) {
            alert('no audiocontext found');
        }
        window.AudioContext = window.webkitAudioContext;
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
    var volume = 0;
    var freqIndex;
    var javascriptNode = context.createScriptProcessor(2048, 1, 1);
//    javascriptNode.connect(context.destination);

    analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 512;
    var amplitudeArray =  new Uint8Array(analyser.frequencyBinCount);

    var drumBuffer;
    var harpBuffer;
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
                analyser.connect(javascriptNode);
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
//   loadSound();
   
    if(DEBUG==true)
                    $( "body" ).append("<div><table><tr><td>name</td><td>keyDown</td><td>keyPress</td><td>keyUp</td><td>mouseUp</td></tr><tr><td>keycode</td><td><div id=\"keydown_debug\"></div></td><td><div id=\"keypress_debug\"></div></td><td><div id=\"keyup_debug\"></div></td><td><div id=\"mouseup_debug\"></div></td></tr><tr><td>start</td><td><div id=\"start_down_debug\"></div></td><td><div id=\"start_press_debug\"></div></td><td><div id=\"start_up_debug\"></div></td><td><div id=\"start_mouseup_debug\"></div></td></tr><tr><td>end</td><td><div id=\"end_down_debug\"></div></td><td><div id=\"end_press_debug\"></div></td><td><div id=\"end_up_debug\"></div></td><td><div id=\"end_mouseup_debug\"></div></td></tr></table></div>");
    

    javascriptNode.onaudioprocess = function() {
        var alpha = 0.8;
        // get the average, bincount is fftsize / 2
        analyser.getByteFrequencyData(amplitudeArray);
        var resultArr = getAverageVolume(amplitudeArray);
        volume = alpha * (resultArr[0]/128.0) + (1-alpha) * volume;
        freqIndex = resultArr[1];
        
        
     //   console.log(volume);
     //   requestFrame
    } 
    
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
      //  console.log("volume:" + average);
        return [average, weightedAverageIndex];
    }
    
    var book;
    var geoindex = 0;
    var geo = [];
    geo[0] = new THREE.Geometry();
    //geo[1] = new THREE.Geometry();
    var fontSize = 32;
    var lettersPerSide = 16;
       
    
    var BOOK="Turn on microphone and type any text.\n";

    var j=0, ln=0, prevJLastLine=0;
    var scaleX = 0.7, scaleY = 1.9;
  //  var scaleX = 5, scaleY = 12;

    var rightMostPosition = 0;
    var rightMostXCoord = -10000;
    var letterPerLine = 60;
    var linePerScreen = 10;
    var offset = 1.0;
//    var offset = 8.0;
    var attributes = {
        strIndex: {type: 'f', value: [] }
    };
    

    function addLetter(code, strIndex, sizeFactor){
        var cx = code % lettersPerSide;
        var cy = Math.floor(code / lettersPerSide);
        //var localscaleX = scaleX * (1+sizeFactor);
        var localOffset = offset * (1+sizeFactor*2.0);
        var localY = ln*scaleY - (sizeFactor/4.0);
        geo[geoindex].vertices.push(
            new THREE.Vector3( j*scaleX, localY, 0 ),
            new THREE.Vector3( j*scaleX+localOffset, localY, 0 ),
            new THREE.Vector3( j*scaleX+localOffset, localY+localOffset, 0 ),
            new THREE.Vector3( j*scaleX, localY+localOffset, 0 )
        );
        console.log("sizeFactor:" + sizeFactor + " added(" + (j*scaleX) + "," + (j*scaleX + offset) +" strIndex : " + strIndex + ")");
        var vcenterX = j;
        var vcenterY = (ln*scaleY*2.0+offset) / 2.0;
        for (var k=0; k<4;k++){
            attributes.strIndex.value[strIndex*4+k] = strIndex;// THREE.Vector2(6.0,12.0);
        }
        var face = new THREE.Face3(strIndex*4+0, strIndex*4+1, strIndex*4+2);
        geo[geoindex].faces.push(face);
        face = new THREE.Face3(strIndex*4+0, strIndex*4+2, strIndex*4+3);
        geo[geoindex].faces.push(face);
        var ox=(cx)/lettersPerSide, oy=(cy+0.05)/lettersPerSide, off=0.9/lettersPerSide;
      //  var sz = lettersPerSide*fontSize;
        geo[geoindex].faceVertexUvs[0].push([
            new THREE.Vector2( ox, oy+off ),
            new THREE.Vector2( ox+off, oy+off ),
            new THREE.Vector2( ox+off, oy )
        ]);
        geo[geoindex].faceVertexUvs[0].push([
            new THREE.Vector2( ox, oy+off ),
            new THREE.Vector2( ox+off, oy ),
            new THREE.Vector2( ox, oy )
        ]);

        if (code == 10 || code == 13 || j  == letterPerLine) {
            ln--;
            prevJLastLine = j;
            j=0;
        } else {
            j++;
            if (rightMostPosition<j){
                rightMostXCoord = j*scaleX+offset;
                rightMostPosition = j;
            }
        }
    }
    
    
    function init(){
        var renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setClearColor( 0xffffff );
        document.body.appendChild(renderer.domElement);
       // FIME (Text vIsualization for Musical Expression
     //   var BOOK="H";
        
        var tex = getKeyTabular(fontSize,"Monospace",lettersPerSide);
        
        tex.flipY = false;
        tex.needsUpdate = true;

        var mat = new THREE.MeshBasicMaterial({map: tex});
        mat.transparent = true;

        var camera = new THREE.PerspectiveCamera(45,1,4,40000);
        camera.setLens(35);

        window.onresize2 = function() {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        };
        window.onresize2();

        var radius = 60;

        var scene = new THREE.Scene();
        camera.position.z = radius;
        scene.add(camera);
        
        var str = BOOK;
        var centerX = (letterPerLine) * scaleX / 2.0;
        var centerY = (-linePerScreen * scaleY )/2.0;

        for (i=0; i<str.length; i++) {
            addLetter(str.charCodeAt(i),i,0);
        }
        rightMostXCoord = (rightMostPosition+1) * scaleX;
       
      //  console.log("length:" + attributes.attCenter.value.length);
    /*    for (var k=0; k<attributes.attCenter.value.length;k++){
            attributes.attCenter.value[k].x -=centerX;
            attributes.attCenter.value[k].y -=centerY;
        }
      */  
        var top = new THREE.Object3D();

        var width = window.innerWidth,
            height = window.innerHeight;

        
        
        var uniforms = {
            time: {type:"f", value:0.0},
            interval : {type:"f", value:0.0},
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

        book = new THREE.Mesh(
            geo[geoindex],
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
            uniforms.time.value += 0.05;
          //  interval -= 0.05;
            uniforms.interval.value = Math.max(Math.min(interval,1.0),0.0);
        //    if ( toggle ) 
          //      uniforms.time.value += 1.0/500.0;
            
  
          /*  var array =  new Uint8Array(analyser.fftSize);
            analyser.getByteTimeDomainData(array);
            //vol_average = getAverageVolume(array)
   //         uniforms.volume.value = vol_average;
            //array.length = 20;
        */     var alpha = 0.5 ;
           
        /*    for (var l=0;l<512;l++){
                uniforms.timeDomain.value[l] = uniforms.timeDomain.value[l] * alpha + (1-alpha ) * (amplitudeArray[l]/256.0-0.5); 
                uniforms.timeDomain2.value[l] = uniforms.timeDomain2.value[l] * alpha + (1-alpha ) * (amplitudeArray2[l]/256.0-0.5); 
            }
            */
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
        window.onkeydown = function(ev){
             var keycode = ev.which;
            if (keycode == 8){
                
                // backspace is not supported for now. j
                ev.preventDefault();
            /*    geoindex++;
                geoindex%=2;
                geo[geoindex] = geo[geoindex].clone();
                book.geometry = geo[geoindex];
                if ( j == 0 )
                {
                    ln ++;
                    j = prevJLastLine;
                    BOOK = BOOK.substring(0,BOOK.length-2);
                }
                else{
                    j--;
                }
                BOOK = BOOK.substring(0,BOOK.length-2);*/
            }
            
              if(DEBUG){
                $("#keydown_debug").html(keycode);
        //        $("#start_down_debug").html(pos[0]);
        //        $("#end_down_debug").html(pos[1]);
                
                keydown_debug_color_index++;
                keydown_debug_color_index%=randomcolor.length;
                $("#keydown_debug").css("background-color", randomcolor[keydown_debug_color_index]);
            } 
        };
        
        window.onkeyup = function(ev){
             var keycode = ev.which;
             if(DEBUG){
                $("#keyup_debug").html(keycode);
        //        $("#start_down_debug").html(pos[0]);
        //        $("#end_down_debug").html(pos[1]);
                
                keyup_debug_color_index++;
                keyup_debug_color_index%=randomcolor.length;
                $("#keyup_debug").css("background-color", randomcolor[keyup_debug_color_index]);
            }  
        };
        var interval = 1, alpha = 0.9, lastKeyTime = 0;
        window.onkeypress = function(ev){
            var keycode = ev.which;
            var currentTime = (new Date()).getTime();
            if (lastKeyTime == 0)
                lastKeyTime = currentTime;
            interval = interval * alpha + (1-alpha) * (currentTime - lastKeyTime) / 1000.0;
            if ((currentTime - lastKeyTime) / 1000.0 > 0.5)
                interval = 1;
            //interval = (currentTime - lastKeyTime);
            console.log(interval);
            lastKeyTime = currentTime;
             if(DEBUG){
                $("#keypress_debug").html(keycode);
        //        $("#start_down_debug").html(pos[0]);
        //        $("#end_down_debug").html(pos[1]);
                
                keypress_debug_color_index++;
                keypress_debug_color_index%=randomcolor.length;
                $("#keypress_debug").css("background-color", randomcolor[keypress_debug_color_index]);
            }  

            

            var prevgeoindex = geoindex;
            geoindex++;
            geoindex%=2;
            geo[geoindex] = geo[prevgeoindex].clone();
            BOOK +=String.fromCharCode(ev.which);
            addLetter(BOOK.charCodeAt(BOOK.length-1),BOOK.length-1,volume);

            if (j == letterPerLine){
                BOOK += "\n";
                addLetter(BOOK.charCodeAt(BOOK.length-1),BOOK.length-1,0);
            }
            //var str = BOOK;
         //   j = 0; ln = 0;
        /*    for (i=0; i<str.length; i++) {
                addLetter(str.charCodeAt(str.length-1));
            }
          */  book.geometry = geo[geoindex];
            //   book.add(geo[geoindex]);
        }
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
    
    init();
  //  book.geo.verticesNeedUpdate = true;
        

       // MUI.buildControls(cmp1, 'rack');

    
};
