/**
 * Renders the blocks snippet in a Jekyll rendered GitHub page
 * @param targetUrl  full editor url (including trailing /)
 * @param repo owner/name of the repository
 * 
 */
function makeCodeRender(targetUrl, repo) {
    // pre waiting to be rendered
    // when undefined, iframe is loaded and ready
    var pendingPres = [];
    function injectRenderer() {
        var f = document.getElementById("makecoderenderer");
        // check iframe already added to the DOM
        if (f) {
            return;
        }
        var f = document.createElement("iframe");
        f.id = "makecoderenderer";
        f.style.position = "absolute";
        f.style.left = 0;
        f.style.bottom = 0;
        f.style.width = "1px";
        f.style.height = "1px";
        f.src = targetUrl + "--docs?render=1"
        document.body.appendChild(f);
    }

    function renderPre(pre) {
    	if(!pre.id) pre.id = Math.random();
        var f = document.getElementById("makecoderenderer");
        // check if iframe is added and ready (pendingPres is undefined)
        if (!f || !!pendingPres) {
            // queue up
            pendingPres.push(pre);
            injectRenderer();
        } else {
            f.contentWindow.postMessage({
                type: "renderblocks",
                id: pre.id,
                code: pre.innerText,
                options: {
                	package: "extension=github:" + repo
                }
            }, targetUrl);
        }
    }

    // listen for messages
    window.addEventListener("message", function (ev) {
        var msg = ev.data;
        if (msg.source != "makecode") return;

        console.log(msg.type)
        switch (msg.type) {
            case "renderready":
                // flush pending requests            				
                var pres = pendingPres;
                // set as undefined to notify that iframe is ready
                pendingPres = undefined;
                pres.forEach(function (pre) { renderPre(pre); })
                break;
            case "renderblocks":
                var svg = msg.svg; // this is an string containing SVG
                var id = msg.id; // this is the id you sent
                var code = document.getElementById(id);
                var originalCode = code.innerText;

                // Create wrapper div that matches mdBook's structure
                var wrapper = document.createElement("div");
                wrapper.className = "codeblock-wrapper";

                // Create the pre element that mdBook expects for copy functionality
                var preElement = document.createElement("pre");
                preElement.className = "codeblock";

                // Create the image
                var img = document.createElement("img");
                img.src = msg.uri;
                img.className = "codeblock";
                // Calculate height based on width while maintaining aspect ratio
                var aspectRatio = msg.height / msg.width;
                img.width = msg.width;
                img.height = Math.round(msg.width * aspectRatio);
                
                // Store original code in a hidden element with the structure mdBook expects
                var hiddenCode = document.createElement("code");
                hiddenCode.style.display = "none";
                hiddenCode.textContent = originalCode;
                
                // Assemble the wrapper following mdBook's structure
                preElement.appendChild(img);
                preElement.appendChild(hiddenCode);
                wrapper.appendChild(preElement);
                
                // Replace the original code element with our wrapper
                code.parentElement.insertBefore(wrapper, code);
                code.parentElement.removeChild(code);
                break;
        }
    }, false);

    var pres = document.querySelectorAll("pre>code[class=language-blocks]");
    Array.prototype.forEach.call(pres, function (pre) {
        renderPre(pre);
    })
}
