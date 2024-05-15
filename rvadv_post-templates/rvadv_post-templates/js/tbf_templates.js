(function() {
    tinymce.create('tinymce.plugins.tbf_templates', {
        init : function(ed, url) {
            const placeholderHtml = `<div class="image-placeholder" style="width: 100%; height: 300px; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center;">
                                        <span>Click to add image</span>
                                    </div>`;

            function addContentTemplateLR(addclass) {
                const content = `
                    <div class="blog-lr-template ${addclass}">
                    <div class="blog-lr-delete-btn">&times;</div>
                        <div class="lr-right">${placeholderHtml}</div>
                        <div class="lr-left">
                            <h4>Title Header 4</h4>
                            <p>Lorem ipsum delroet magna carter deus reputis solicat, lorem ipsum delroet magna carter deus reputis solicat</p>
                            <p>Deus reputis solicat lorem ipsum reputis solicat, lorem ipsum delroet magna delroet magna carter deus carter</p>
                            <a href="#" class="cta-btn">CTA Button</a>
                        </div>
                    </div>
                `;
                insertAtRootLevel(ed, content);
            }

            function addCTAButton() {
                const content = `<a href="#" class="cta-btn">CTA Button</a>`;
                const node = ed.selection.getNode();

                if (node.nodeName === 'A' && node.className.includes('cta-btn')) {
                    const placeholder = document.createElement('div');
                    placeholder.innerHTML = content;
                    const newBtn = placeholder.firstChild;

                    node.parentNode.insertBefore(newBtn, node.nextSibling);
                } else {
                    ed.execCommand('mceInsertContent', false, content);
                }
            }

            ed.addButton('tbf_button_one', {
                title: 'Insert Left Image Template',
                icon: 'template1',
                onclick: function() { addContentTemplateLR(); }
            });

            ed.addButton('tbf_button_two', {
                title: 'Insert Right Image Template',
                icon: 'template2',
                onclick: function() { addContentTemplateLR("reverse"); }
            });
            
            ed.on('init', function() {
                ed.getBody().addEventListener('click', function(e) {
                    let target = e.target;
                    while (target && target.parentNode) {
                        if (target.className && target.className.includes('blog-lr-delete-btn')) {
                            const templateDiv = target.closest('.blog-lr-template');
                            if (templateDiv) {
                                templateDiv.parentNode.removeChild(templateDiv);
                            }
                            e.preventDefault();
                            return;
                        }
                        target = target.parentNode;
                    }
                }, true);
            });            

            ed.addButton('tbf_button_three', {
                title: 'Insert CTA Button',
                text: 'CTA Button',
                onclick: function() { addCTAButton(); }
            });

            function insertAtRootLevel(editor, content) {
                var node = editor.selection.getNode();
                var div = document.createElement('div');
                div.innerHTML = content.trim();
                var element = div.firstChild;
                while (node) {
                    if (node.className && node.className.includes('blog-lr-template')) {
                        if (node.nextSibling) {
                            node.parentNode.insertBefore(element, node.nextSibling);
                        } else {
                            node.parentNode.appendChild(element);
                        }
                        return;
                    }
                    node = node.parentNode;
                }
                editor.execCommand('mceInsertContent', false, content);
            }

            ed.on('click', function(e) {
                if (e.target.className.includes('image-placeholder')) {
                    openMediaFrame(e.target);
                }
            });

            function openMediaFrame(imagePlaceholder) {
                var frame = wp.media({
                    title: 'Select or Upload Media for Your Template',
                    button: {
                        text: 'Use this media'
                    },
                    multiple: false
                });

                frame.on('select', function() {
                    var attachment = frame.state().get('selection').first().toJSON();
                    var imgHtml = `<img src="${attachment.url}" alt="" style="width: 100%;">`;
                    imagePlaceholder.outerHTML = imgHtml;
                });

                frame.open();
            }

            ed.on('NodeChange', function(e) {
                const lrRights = ed.getBody().querySelectorAll('.lr-right');
                lrRights.forEach(function(lrRight) {
                    if (!lrRight.querySelector('img') && !lrRight.querySelector('.image-placeholder')) {
                        var div = document.createElement('div');
                        div.innerHTML = placeholderHtml.trim();
                        var placeholderElement = div.firstChild;
                        lrRight.appendChild(placeholderElement);
                    }
                });
            });
        },
        createControl : function(n, cm) {
            return null;
        }
    });
    tinymce.PluginManager.add('tbf_templates', tinymce.plugins.tbf_templates);
})();