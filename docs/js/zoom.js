// Initialize zoom functionality
function initializeZoom() {
    // Get all codeblock images
    const codeblocks = document.querySelectorAll('.codeblock');

    codeblocks.forEach(img => {
        // Skip if already initialized
        if (img.dataset.zoomInitialized) return;
        img.dataset.zoomInitialized = 'true';

        // Variable to track if image is zoomable
        let isZoomable = false;

        // Create container if not already wrapped
        if (!img.parentElement.classList.contains('codeblock-container')) {
            const container = document.createElement('div');
            container.className = 'codeblock-container';
            img.parentNode.insertBefore(container, img);
            container.appendChild(img);

            const MIN_CONTAINER_HEIGHT = 5; // Reduced minimum container height
            
            // Function to set container dimensions based on natural image size
            function updateContainerDimensions() {
                // Wait for image to be loaded to get proper dimensions
                if (img.complete) {
                    // Check if image dimensions and aspect ratio suggest it needs zooming
                    const aspectRatio = img.naturalWidth / img.naturalHeight;
                    const isLargeImage = img.naturalHeight > 1000; // Images over 1000px height are considered large
                    const hasZoomableAspectRatio = aspectRatio > 1.5 && aspectRatio < 2; // Aspect ratio between 1.5:1 and 2:1
                    
                    isZoomable = isLargeImage && hasZoomableAspectRatio;
                    
                    // For non-zoomable images, scale down to be proportional to text
                    if (!isZoomable) {
                        // Scale factor for non-zoomable images (reduces size by ~50%)
                        const SCALE_FACTOR = 0.25;
                        
                        // Calculate scaled dimensions
                        const scaledWidth = img.naturalWidth * SCALE_FACTOR;
                        const scaledHeight = img.naturalHeight * SCALE_FACTOR;
                        
                        // If scaled width is still larger than container, scale down further
                        if (scaledWidth > container.offsetWidth) {
                            const ratio = container.offsetWidth / scaledWidth;
                            container.style.width = '100%';
                            container.style.height = `${scaledHeight * ratio}px`;
                            img.style.width = '100%';
                            img.style.height = `${scaledHeight * ratio}px`;
                        } else {
                            // Use scaled dimensions directly
                            container.style.width = `${scaledWidth}px`;
                            container.style.height = `${scaledHeight}px`;
                            img.style.width = `${scaledWidth}px`;
                            img.style.height = `${scaledHeight}px`;
                        }
                        container.style.minHeight = 'none';
                        
                        // Log the scaling information
                        console.log(`Original size: ${img.naturalWidth}x${img.naturalHeight}, Scaled size: ${scaledWidth}x${scaledHeight}`);
                    } else {
                        // For zoomable images, maintain the precise sizing
                        const height = img.naturalHeight * (container.offsetWidth / img.naturalWidth);
                        container.style.height = `${height}px`;
                        container.style.minHeight = `${MIN_CONTAINER_HEIGHT}px`;
                        container.style.width = '100%';
                        img.style.width = '100%';
                        img.style.height = 'auto';
                    }
                    
                    // Log width comparison to console
                    console.log(`Image: ${img.alt || 'unnamed'} - Natural width: ${img.naturalWidth}px x ${img.naturalHeight}px, Container width: ${container.offsetWidth}px x ${container.offsetHeight}px, Aspect ratio: ${aspectRatio.toFixed(2)}, Large: ${isLargeImage}, Good ratio: ${hasZoomableAspectRatio}, Zoomable: ${isZoomable}`);
                    
                    img.style.cursor = isZoomable ? 'zoom-in' : 'default';
                    
                } else {
                    img.onload = () => {
                        // Same logic as above
                        const aspectRatio = img.naturalWidth / img.naturalHeight;
                        const isLargeImage = img.naturalHeight > 1000;
                        const hasZoomableAspectRatio = aspectRatio > 1.5 && aspectRatio < 2;
                        
                        isZoomable = isLargeImage && hasZoomableAspectRatio;
                        
                        if (!isZoomable) {
                            // Scale factor for non-zoomable images (reduces size by ~50%)
                            const SCALE_FACTOR = 0.5;
                            
                            // Calculate scaled dimensions
                            const scaledWidth = img.naturalWidth * SCALE_FACTOR;
                            const scaledHeight = img.naturalHeight * SCALE_FACTOR;
                            
                            // If scaled width is still larger than container, scale down further
                            if (scaledWidth > container.offsetWidth) {
                                const ratio = container.offsetWidth / scaledWidth;
                                container.style.width = '100%';
                                container.style.height = `${scaledHeight * ratio}px`;
                                img.style.width = '100%';
                                img.style.height = `${scaledHeight * ratio}px`;
                            } else {
                                // Use scaled dimensions directly
                                container.style.width = `${scaledWidth}px`;
                                container.style.height = `${scaledHeight}px`;
                                img.style.width = `${scaledWidth}px`;
                                img.style.height = `${scaledHeight}px`;
                            }
                            container.style.minHeight = 'none';
                            
                            // Log the scaling information
                            console.log(`Original size: ${img.naturalWidth}x${img.naturalHeight}, Scaled size: ${scaledWidth}x${scaledHeight}`);
                        } else {
                            // For zoomable images, maintain the precise sizing
                            const height = img.naturalHeight * (container.offsetWidth / img.naturalWidth);
                            container.style.height = `${height}px`;
                            container.style.minHeight = `${MIN_CONTAINER_HEIGHT}px`;
                            container.style.width = '100%';
                            img.style.width = '100%';
                            img.style.height = 'auto';
                        }
                        
                        console.log(`Image: ${img.alt || 'unnamed'} - Natural width: ${img.naturalWidth}px x ${img.naturalHeight}px, Container width: ${container.offsetWidth}px x ${container.offsetHeight}px, Aspect ratio: ${aspectRatio.toFixed(2)}, Large: ${isLargeImage}, Good ratio: ${hasZoomableAspectRatio}, Zoomable: ${isZoomable}`);
                        
                        img.style.cursor = isZoomable ? 'zoom-in' : 'default';
                    };
                }
            }

            // Set initial dimensions
            updateContainerDimensions();

            // Update dimensions on window resize
            window.addEventListener('resize', () => {
                console.log('Window resized - recalculating dimensions');
                updateContainerDimensions();
            });
        }

        let scale = 1;
        let translateX = 0;
        let translateY = 0;
        let isDragging = false;
        let startX, startY;
        const MIN_SCALE = 1;
        const MAX_SCALE = 4;
        const ZOOM_SPEED = 0.1;

        function updateTransform() {
            requestAnimationFrame(() => {
                img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
                
                // Update container height based on zoom level
                const container = img.parentElement;
                if (scale > 1) {
                    // When zoomed, ensure container has enough height
                    const scaledHeight = img.naturalHeight * scale;
                    if (scaledHeight > container.offsetHeight) {
                        container.style.height = `${scaledHeight}px`;
                    }
                }
            });
        }

        function constrainTranslation() {
            const container = img.parentElement;
            const maxTranslateX = (container.offsetWidth * (scale - 1)) / 2;
            const maxTranslateY = (container.offsetHeight * (scale - 1)) / 2;
            
            translateX = Math.min(maxTranslateX, Math.max(-maxTranslateX, translateX));
            translateY = Math.min(maxTranslateY, Math.max(-maxTranslateY, translateY));
        }

        // Handle mouse wheel for zoom
        img.addEventListener('wheel', function(e) {
            // Only allow zooming if the image is wider than its container or already zoomed
            if (!isZoomable && scale === 1) {
                console.log('Zoom prevented - Image not zoomable:', isZoomable, 'Current scale:', scale);
                return;
            }
            
            // If we're zoomed out and trying to zoom out further, prevent it
            if (scale === 1 && Math.sign(e.deltaY) > 0 && !isZoomable) {
                console.log('Zoom out prevented - Already at minimum scale');
                return;
            }
            
            e.preventDefault();
            const container = img.parentElement;
            const rect = container.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            // Calculate zoom
            const delta = -Math.sign(e.deltaY) * ZOOM_SPEED;
            const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * (1 + delta)));
            
            if (newScale !== scale) {
                console.log('Zooming - Current scale:', scale, 'New scale:', newScale, 'isZoomable:', isZoomable);
                
                // Calculate mouse position relative to image
                const scaleRatio = newScale / scale;
                
                // Update scale and position
                scale = newScale;
                translateX = mouseX - (mouseX - translateX) * scaleRatio;
                translateY = mouseY - (mouseY - translateY) * scaleRatio;
                
                constrainTranslation();
                updateTransform();
                
                // Update cursor and class
                if (scale > 1) {
                    img.classList.add('zoomed');
                    img.style.cursor = 'grab';
                } else {
                    img.classList.remove('zoomed');
                    img.style.cursor = isZoomable ? 'zoom-in' : 'default';
                    
                    // Reset container height when zooming out completely
                    updateContainerDimensions();
                }
            }
        });

        // Handle drag start
        img.addEventListener('mousedown', function(e) {
            if (scale > 1 || (isZoomable && e.button === 0)) {
                isDragging = true;
                startX = e.clientX - translateX;
                startY = e.clientY - translateY;
                img.style.cursor = 'grabbing';
                e.preventDefault();
            }
        });

        // Handle drag
        window.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            
            translateX = e.clientX - startX;
            translateY = e.clientY - startY;
            constrainTranslation();
            updateTransform();
        });

        // Handle drag end
        window.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                img.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
            }
        });

        // Handle touch events for mobile
        let initialDist = 0;
        let initialScale = 1;
        let lastCenterX = 0;
        let lastCenterY = 0;

        img.addEventListener('touchstart', function(e) {
            if (e.touches.length === 2 && (isZoomable || scale > 1)) {
                e.preventDefault();
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                
                initialDist = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
                initialScale = scale;
                
                // Calculate the center point of the two touches
                lastCenterX = (touch1.clientX + touch2.clientX) / 2;
                lastCenterY = (touch1.clientY + touch2.clientY) / 2;
            } else if (scale > 1 && e.touches.length === 1) {
                isDragging = true;
                startX = e.touches[0].clientX - translateX;
                startY = e.touches[0].clientY - translateY;
                e.preventDefault();
            }
        });

        img.addEventListener('touchmove', function(e) {
            if (e.touches.length === 2) {
                e.preventDefault();
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                
                // Calculate new scale
                const dist = Math.hypot(
                    touch2.clientX - touch1.clientX,
                    touch2.clientY - touch1.clientY
                );
                const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, initialScale * (dist / initialDist)));
                
                // Calculate the new center point
                const centerX = (touch1.clientX + touch2.clientX) / 2;
                const centerY = (touch1.clientY + touch2.clientY) / 2;
                
                // Update position based on the change in center point
                if (scale > 1) {
                    translateX += centerX - lastCenterX;
                    translateY += centerY - lastCenterY;
                }
                
                scale = newScale;
                constrainTranslation();
                updateTransform();
                
                lastCenterX = centerX;
                lastCenterY = centerY;
                
                // Update cursor and class
                if (scale > 1) {
                    img.classList.add('zoomed');
                    img.style.cursor = 'grab';
                } else {
                    img.classList.remove('zoomed');
                    img.style.cursor = 'zoom-in';
                }
            } else if (isDragging && e.touches.length === 1) {
                translateX = e.touches[0].clientX - startX;
                translateY = e.touches[0].clientY - startY;
                constrainTranslation();
                updateTransform();
                e.preventDefault();
            }
        });

        img.addEventListener('touchend', function(e) {
            isDragging = false;
            if (e.touches.length === 0) {
                img.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
            }
        });

        // Handle escape key to reset zoom
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && scale > 1) {
                scale = 1;
                translateX = 0;
                translateY = 0;
                img.classList.remove('zoomed');
                img.style.cursor = 'zoom-in';
                updateTransform();
                
                // Reset container height when resetting zoom
                updateContainerDimensions();
            }
        });
    });
}

// Handle dynamic content loading in MDBook (including initial load and theme changes)
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
            initializeZoom();
        }
    });
});

// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true });