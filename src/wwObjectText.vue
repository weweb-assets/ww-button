<script>
import Vue from "vue";

/* wwManager:start */
import wwTextBar from "./wwTextBar.vue";
import wwTextPopupHtml from "./wwTextPopupHtml.vue";
import { setTimeout } from "timers";
wwLib.wwPopups.addPopup("wwTextPopupHtml", wwTextPopupHtml);
import Quill from "quill";

wwLib.wwPopups.addStory("WWTEXT_LINKS", {
    title: {
        en: "Link",
        fr: "Lien",
    },
    type: "wwPopupLinks",
    storyData: {
        links: [
            "EXTERNAL",
            "INTERNAL",
            "SECTION",
            // 'POPUP',
            "DOWNLOAD",
            "CLOSE_POPUP",
            // 'NO_LINK'
        ],
    },
});
/* wwManager:end */

export default {
    name: "__COMPONENT_NAME__",
    components: {},

    render(createVNode) {
        if (this.clearRender) {
            this.$nextTick(function() {
                this.clearRender = false;
                this.$forceUpdate();
            });
            this.$el.innerHTML = "";
            return createVNode(
                this.wwObject.content.data.tag || "div",
                {
                    class: {
                        "ww-text": true,
                    },
                    attrs: {
                        // contenteditable: this.editing
                    },
                },
                null
            );
        } else {
            const self = this;
            function createVNodes(childNodes) {
                let vNodes = [];

                for (const node of childNodes) {
                    let vNode = null;

                    if (node.nodeName.toLowerCase() == "#comment") {
                        //Do nothing.
                    } else if (node.nodeName.toLowerCase() == "#text") {
                        vNode = self._v(node.textContent);
                    } else if (node.nodeName.toLowerCase() == "ww-object") {
                        let vn = createVNodes(node.childNodes);

                        let attributes = {};

                        for (let a of node.attributes) {
                            attributes[a.nodeName] = a.nodeValue;
                        }
                        for (let key in self.wwAttrs) {
                            attributes[key] = self.wwAttrs[key];
                        }

                        attributes.wwInsideWwObject = "ww-text";

                        let wwObjectData;
                        if (self.wwObject.content.data.children && self.wwObject.content.data.children[node.attributes["data-ww-object-id"].nodeValue]) {
                            wwObjectData = self.wwObject.content.data.children[node.attributes["data-ww-object-id"].nodeValue];
                        } else if (self.wwObject.data.children && self.wwObject.data.children[node.attributes["data-ww-object-id"].nodeValue]) {
                            wwObjectData = self.wwObject.data.children[node.attributes["data-ww-object-id"].nodeValue];
                        }

                        vNode = createVNode(
                            node.nodeName.toLowerCase(),
                            {
                                props: {
                                    wwObject: wwObjectData,
                                    inText: true,
                                },
                                attrs: attributes,
                            },
                            vn
                        );
                    } else if (node.nodeName.toLowerCase() == "ww-link") {
                        let vn = createVNodes(node.childNodes);

                        const valueObject = JSON.parse(node.attributes["data-ww-link"].nodeValue);
                        const linkType = Object.keys(valueObject)[0];
                        let linkData = {
                            type: "none",
                            data: {},
                        };
                        switch (linkType) {
                            case "linkExt":
                                linkData.type = "ww-link-ext";
                                linkData.data.url = valueObject[linkType];
                                break;
                            case "linkPage":
                                linkData.type = "ww-link-page";
                                linkData.data.id = valueObject[linkType];
                                break;
                            case "linkSection":
                                linkData.type = "ww-link-section";
                                linkData.data.id = valueObject[linkType];
                                break;
                            case "linkFile":
                                linkData.type = "ww-link-file";
                                linkData.data.url = valueObject[linkType];
                                break;
                            case "linkClosePopup":
                                linkData.type = "ww-link-closepopup";
                                break;
                        }

                        let wwLink = wwLib.wwLinks.getLinkParams(linkData, self.$el);

                        vNode = createVNode(
                            node.nodeName.toLowerCase(),
                            {
                                props: {
                                    wwLink: wwLink,
                                    inText: true,
                                },
                                // attrs: attributes
                            },
                            vn
                        );
                    } else if (node.nodeName.toLowerCase() == "script") {
                        continue;
                    } else {
                        let vn = createVNodes(node.childNodes);

                        let attributes = {};

                        if (node.attributes) {
                            for (let a of node.attributes) {
                                attributes[a.nodeName] = a.nodeValue;
                            }
                        }

                        const nodeName = node.nodeName.toLowerCase() == "p" ? "div" : node.nodeName.toLowerCase();

                        vNode = createVNode(
                            nodeName,
                            {
                                attrs: attributes,
                            },
                            vn
                        );
                    }

                    if (vNode) {
                        vNodes.push(vNode);
                    }
                }

                return vNodes;
            }

            const nodes = [];

            const wwObjRegex = /\[\[wwObject\s*=\s*([^\]]*)\]\]/gi;
            const wwLinkRegex = /\[\[wwLink\s*=\s*([^\|]*)\s*\|\s*text\s*=\s*([^\]]*)\]\]/gi;

            let text = wwLib.wwLang.getText(this.wwObject.content.data.text).replace(wwObjRegex, '<ww-object data-ww-object-id="$1"></ww-object>') || "<br/>";
            text = text.replace(wwLinkRegex, "<ww-link data-ww-link='$1'>$2</ww-link>") || "<br/>";
            const contentText = document.createElement("div");
            contentText.innerHTML = text;
            const childNodesText = contentText.childNodes;
            const nodesText = createVNodes(childNodesText);
            const textClasses = ["ww-text-content"];
            this.wwObject.content.data.fontStyle && textClasses.push(this.wwObject.content.data.fontStyle);
            const nodeText = createVNode(
                "div",
                {
                    class: textClasses,
                    attrs: {
                        style: this.editingSection ? "display:none;" : "",
                    },
                },
                nodesText
            );
            nodes.push(nodeText);

            /* wwManager:start */
            const quillClasses = ["ww-text-editor"];
            this.wwObject.content.data.fontStyle && quillClasses.push(this.wwObject.content.data.fontStyle);
            const nodeQuill = createVNode(
                "div",
                {
                    class: quillClasses,
                    attrs: {
                        style: this.editingSection ? "" : "display:none;",
                    },
                },
                null
            );
            nodes.push(nodeQuill);
            /* wwManager:end */

            const classes = ["ww-text"];
            //this.wwObject.content.data.fontStyle && classes.push(this.wwObject.content.data.fontStyle);
            const root = createVNode(
                this.wwObject.content.data.tag || "div",
                {
                    class: classes,
                },
                nodes
            );

            return root;
        }
    },

    props: {
        wwObjectCtrl: Object,
        wwAttrs: {
            type: Object,
            default: {},
        },
    },
    data() {
        return {
            d_edited: false,
            /* wwManager:start */
            quill: null,
            textBar: null,
            textSelection: null,
            focus: false,
            clearRender: false,
            /* wwManager:end */
        };
    },
    computed: {
        wwObject() {
            return this.wwObjectCtrl.get();
        },
        editing() {
            return this.wwObjectCtrl.getSectionCtrl() && this.wwObjectCtrl.getSectionCtrl().getEditMode() == "CONTENT" && this.focus;
        },
        editingSection() {
            return this.wwObjectCtrl.getSectionCtrl() && this.wwObjectCtrl.getSectionCtrl().getEditMode() == "CONTENT";
        },
        // text() {
        //     console.log('CHANGED LANG');
        //     // <span class="ww-object-embed" data-ww-object-id="0"></span>
        //     // [[wwObject=0]]

        //     let text = wwLib.wwLang.getText(this.wwObject.content.data.text);
        //     const wwObjRegex = /\[\[wwObject=([^\]]*)\]\]/gi;

        //     text = text.replace(wwObjRegex, '<span class="ww-object-embed" data-ww-object-id="$1"></span>');

        //     return text;
        // }
    },
    watch: {
        /* wwManager:start */
        async editingSection(a, oldEditingSection) {
            if (this.editingSection && !this.oldEditingSection) {
                //this.correctText();

                this.$nextTick(() => {
                    this.loadQuill();
                    this.quill.disable();
                });
            }
        },
        /* wwManager:end */
    },
    methods: {
        async init() {
            /* wwManager:start */
            this.$el.addEventListener("mousedown", this.preventNextClick);
            this.$el.addEventListener("click", wwLib.wwObjectMenu.close);

            // await wwLib.wwUtils.addScriptToHead({
            //     link: 'https://cdn.quilljs.com/1.3.6/quill.js'
            // });

            await this.loadQuillModules();

            if (this.editingSection) {
                //this.correctText();
                this.$nextTick(() => {
                    this.loadQuill();
                    this.quill.disable();
                });
            }
            /* wwManager:end */
        },

        /*
        isTextEmpty() {
            return this.text.trim() == "";
        },
        */
        /*
        getType(text) {
            if (text && text.indexOf("wwObject=") == 0) {
                return 'wwObject';
            }
            return 'wwSimpleText';
        },
        */
        /*
        isWwObject(text) {
            return text.indexOf("wwObject=") == 0;
        },
        */
        /*
        getWwObject(text) {
            let index = text.replace('wwObject=', '');
            try {
                index = parseInt(index);
            }
            catch (e) {
                return text;
            }
            if (this.wwObject.content.data && this.wwObject.content.data.children && this.wwObject.content.data.children[index]) {
                return this.wwObject.content.data.children[index];
            }
            return text;
        },
        */

        /* wwManager:start */

        preventNextClick(event) {
            if (!this.focus) {
                return;
            }
            let mouseDownCoords = [event.clientX, event.clientY];
            let preventNext = false;

            function onMouseMove(event) {
                const distX = Math.abs(mouseDownCoords[0] - event.clientX);
                const distY = Math.abs(mouseDownCoords[1] - event.clientY);

                if (distX > 10 || distY > 10) {
                    wwLib.wwUtils.preventNextFocus();
                    preventNext = true;
                }
            }

            function onClick(event) {
                if (preventNext) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                wwLib.getFrontWindow().removeEventListener("click", onClick, { capture: true });
                wwLib.getManagerWindow().removeEventListener("click", onClick, { capture: true });
                wwLib.getFrontWindow().removeEventListener("mousemove", onMouseMove);
                wwLib.getManagerWindow().removeEventListener("mousemove", onMouseMove);
            }

            wwLib.getFrontWindow().addEventListener("click", onClick, { capture: true });
            wwLib.getManagerWindow().addEventListener("click", onClick, { capture: true });
            wwLib.getFrontWindow().addEventListener("mousemove", onMouseMove);
            wwLib.getManagerWindow().addEventListener("mousemove", onMouseMove);
        },

        correctText() {
            let corrected = false;
            for (const lang of Object.keys(this.wwObject.content.data.text)) {
                if (this.wwObject.content.data._q && this.wwObject.content.data._q[lang]) {
                    continue;
                }
                corrected = true;

                this.d_edited = true;

                let text = this.wwObject.content.data.text[lang];

                this.wwObject.content.data.text[lang] = this._correctText(text);
                this.wwObject.content.data._q = this.wwObject.content.data._q && typeof this.wwObject.content.data._q == "object" ? this.wwObject.content.data._q : {};
                this.wwObject.content.data._q[lang] = true;
            }

            corrected && this.wwObjectCtrl.update(this.wwObject);

            // this.$nextTick(() => {
            return true;
            // });
        },

        _correctText(text) {
            const wwObjRegex = /\[\[wwObject\s*=\s*([^\]]*)\]\]/gi;
            text = text.replace(wwObjRegex, '<span class="ww-object-embed" data-ww-object-id="$1"></span>');

            const elem = document.createElement("div");
            const elemP = document.createElement("p");
            elem.append(elemP);
            elemP.innerHTML = text;

            let self = this;

            function getFontSize(el) {
                let size = el.style.fontSize;
                if (size) {
                    if (size.indexOf("rem") !== -1) {
                        size = parseFloat(size.replace("rem", "")) * 16;
                    } else {
                        size = parseFloat(size.replace("px", ""));
                    }

                    let fontSizes = [];
                    for (let fontSize of wwLib.wwWebsiteData.getDesign().info.fontSizes.list) {
                        fontSizes.push({
                            name: fontSize.name,
                            size: parseFloat(fontSize.screens.lg),
                            className: fontSize.className,
                        });
                    }

                    let closest = fontSizes.reduce(function(prevSize, currSize) {
                        return Math.abs(currSize.size - size) < Math.abs(prevSize.size - size) ? currSize : prevSize;
                    });

                    const newSize = closest.className;
                    return newSize;
                }

                return "";
            }

            function parseHtml(el) {
                for (let i = 0; i < el.children.length; i++) {
                    let subEl = el.children[i];

                    let subNewEl;

                    switch (subEl.tagName) {
                        case "SPAN":
                        case "DIV":
                            subNewEl = document.createElement(subEl.tagName);

                            let align = subEl.style.textAlign;
                            align = align != "inherit" ? align : null;

                            if (align) {
                                subNewEl.style.textAlign = align;
                            }

                            let newFontSize = getFontSize(subEl);
                            newFontSize && subNewEl.classList.add(newFontSize);
                            subNewEl.innerHTML = subEl.innerHTML;

                            break;
                        case "FONT":
                            let style = "";

                            if (subEl.attributes.color && subEl.attributes.color.nodeValue && subEl.attributes.color.nodeValue != "inherit") {
                                style += "color:" + subEl.attributes.color.nodeValue + ";";
                            }

                            if (subEl.attributes.face && subEl.attributes.face.nodeValue && subEl.attributes.face.nodeValue != "inherit") {
                                style += "font-family:" + subEl.attributes.face.nodeValue + ";";
                            }

                            subNewEl = document.createElement("span");
                            subNewEl.innerHTML = subEl.innerHTML;
                            subNewEl.setAttribute("style", style);
                            let newFontSize2 = getFontSize(subEl);
                            newFontSize2 && subNewEl.classList.add(newFontSize2);

                            break;

                        case "B":
                            subNewEl = document.createElement("strong");
                            subNewEl.innerHTML = subEl.innerHTML;
                            break;
                        case "I":
                            subNewEl = document.createElement("em");
                            subNewEl.innerHTML = subEl.innerHTML;

                            break;
                        default:
                            subNewEl = document.createElement(subEl.tagName);
                            subNewEl.innerHTML = subEl.innerHTML;

                            break;
                    }

                    parseHtml(subNewEl);

                    el.insertBefore(subNewEl, subEl);

                    subEl.remove();
                }
            }

            parseHtml(elemP);

            return elem.innerHTML;
        },

        loadQuill() {
            this.quill = new Quill(this.$el.querySelector(".ww-text-editor"));
            this.quill.disable();
            const wwObjRegex = /\[\[wwObject\s*=\s*([^\]]*)\]\]/gi;
            const wwLinkRegex = /\[\[wwLink\s*=\s*([^\|]*)\s*\|\s*text\s*=\s*([^\]]*)\]\]/gi;
            let text = wwLib.wwLang.getText(this.wwObject.content.data.text).replace(wwObjRegex, '<span class="ww-object-embed" data-ww-object-id="$1"></span>') || "<br/>";
            text = text.replace(wwLinkRegex, "<span class='ww-link-inline' data-ww-link='$1'>$2</span>");
            this.quill.pasteHTML(text);
        },

        reloadQuill() {
            this.clearRender = true;

            setTimeout(() => {
                if (this.editingSection) {
                    this.loadQuill();
                }
            }, 100);
        },

        async loadQuillModules() {
            if (!Quill.imports["formats/ww-object-embed"]) {
                const Parchment = Quill.import("parchment");
                const Embed = Quill.import("blots/embed");
                const Block = Quill.import("blots/block");
                const TextBlot = Quill.import("blots/text");
                const Break = Quill.import("blots/break");
                const Cursor = Quill.import("blots/cursor");
                const Inline = Quill.import("blots/inline");
                const Container = Quill.import("blots/container");
                const Scroll = Quill.import("blots/scroll");

                // WWOBJECT
                function createWwObject(self, wwObjectIndex) {
                    let wwObjectData;

                    if (wwObjectIndex && self.wwObject.content.data.children && self.wwObject.content.data.children[wwObjectIndex]) {
                        wwObjectData = self.wwObject.content.data.children[wwObjectIndex];
                    } else if (wwObjectIndex && self.wwObject.data.children && self.wwObject.data.children[wwObjectIndex]) {
                        wwObjectData = self.wwObject.data.children[wwObjectIndex];
                    } else {
                        wwObjectData = wwLib.wwObject.getDefault({ type: "ww-icon" });

                        self.wwObject.content.data.children = self.wwObject.content.data.children || [];

                        wwObjectIndex = 0;
                        //Find first empty index in current wwObject children
                        while (self.wwObject.content.data.children[wwObjectIndex]) {
                            wwObjectIndex++;
                        }

                        self.wwObject.content.data.children[wwObjectIndex] = wwObjectData;

                        self.wwObjectCtrl.update(self.wwObject);
                    }

                    for (let c of self.$children) {
                        if (c.c_wwObject && c.c_wwObject.uniqueId == wwObjectData.uniqueId) {
                            c.$destroy();
                        }
                    }

                    const wwObject = new Vue.options.components.wwObject({ propsData: { wwObject: wwObjectData } });
                    wwObject.$parent = self;
                    self.$children.push(wwObject);
                    wwObject.$store = self.$store;
                    wwObject.$mount();

                    // wwObject.$el.setAttribute('ww-inside-ww-object', 'ww-text');

                    return { el: wwObject.$el, wwObjectId: wwObjectIndex };
                }
                class WwObject extends Embed {
                    static create(value) {
                        const node = super.create(value);
                        node.setAttribute("data-ww-object-id", value);

                        return node;
                    }

                    static formats(node) {
                        return {
                            wwObjectId: node.getAttribute("data-ww-object-id"),
                        };
                    }

                    attach() {
                        super.attach();
                        const vueNode = this.getVueNode();

                        this.domNode.innerHTML = "";

                        if (!vueNode) {
                            return;
                        } else {
                            const { el, wwObjectId } = createWwObject(vueNode.__vue__, this.domNode.getAttribute("data-ww-object-id") || "");
                            this.domNode.setAttribute("data-ww-object-id", wwObjectId);
                            this.domNode.appendChild(el);
                        }
                    }

                    getVueNode() {
                        let node = this.domNode.parentNode;
                        while (node && !node.__vue__) {
                            node = node.parentNode;
                        }
                        if (node && node.__vue__) {
                            return node;
                        } else {
                            return null;
                        }
                    }

                    // get value of the node (for implement undo function)
                    static value(node) {
                        return node.getAttribute("data-ww-object-id") || "";
                    }
                }
                WwObject.blotName = "ww-object-embed";
                WwObject.tagName = "SPAN";
                WwObject.className = "ww-object-embed";
                Quill.register(WwObject, true);

                // LINE
                class Line extends Embed {
                    static create(value) {
                        try {
                            value = JSON.parse(value);
                        } catch (error) {
                            value = {};
                        }
                        const node = super.create(value);

                        node.style.lineHeight = (value.height || 1) + "px";
                        const line = document.createElement("div");
                        line.style.width = value.width || "100%";
                        line.style.display = "inline-block";
                        line.style.borderTop = (value.height || 1) + "px solid";
                        line.style.borderTopColor = value.color || "black";
                        line.style.margin = "2px 0";
                        line.classList.add("line");

                        node.setAttribute("data-line", JSON.stringify(value));

                        node.appendChild(line);
                        return node;
                    }

                    format(name, value) {
                        if (name == "color" && value) {
                            this.domNode.querySelector(".line").style.borderTopColor = value;
                            let _value = JSON.parse(this.domNode.getAttribute("data-line") || "{}");
                            _value.color = value;
                            this.domNode.setAttribute("data-line", JSON.stringify(_value));
                        }
                    }

                    static formats(node) {
                        return JSON.parse(node.getAttribute("data-line") || "{}");
                    }

                    // get value of the node (for implement undo function)
                    static value(node) {
                        return node.getAttribute("data-line") || "{}";
                    }
                }
                Line.blotName = "line";
                Line.tagName = "SPAN";
                Line.className = "line";
                Quill.register(Line, true);

                // LIST ITEM COLOR
                class ListItemColor extends Parchment.Attributor.Style {
                    value(node) {
                        let value = super.value(node);

                        if (!value.startsWith("rgb(")) return value;

                        value = value.replace(/^[^\d]+/, "").replace(/[^\d]+$/, "");

                        const color =
                            "#" +
                            value
                                .split(",")
                                .map(function(component) {
                                    return ("00" + parseInt(component, 10).toString(16)).slice(-2);
                                })
                                .join("");
                        return color;
                    }
                }
                const listItemColor = new ListItemColor("li-color", "color", {
                    scope: Parchment.Scope.BLOCK,
                });
                Quill.register(listItemColor);

                // LIST ITEM SIZE
                class ListItemSize extends Parchment.Attributor.Class {
                    value(node) {
                        let value = super.value(node);
                        return value;
                    }
                }
                const listItemSize = new ListItemSize("li-size", "ww-font-size", {
                    scope: Parchment.Scope.BLOCK,
                });
                Quill.register(listItemSize);

                // LIST ITEM FONT
                class ListItemFont extends Parchment.Attributor.Style {
                    value(node) {
                        let value = super.value(node);
                        return value;
                    }
                }
                const listItemFont = new ListItemFont("li-font", "font-family", {
                    scope: Parchment.Scope.BLOCK,
                });
                Quill.register(listItemFont);

                // STYLISED LIST ITEM
                var ListItem = Quill.import("formats/list/item");
                class ListItemStyle extends ListItem {
                    format(name, value) {
                        if (name == "li-font") {
                            this.domNode.style.fontFamily = value;
                        } else if (name == "li-size") {
                            for (let c of this.domNode.classList) {
                                if (c.indexOf("ww-font-size-") === 0) {
                                    this.domNode.classList.remove(c);
                                }
                            }
                            if (value) {
                                this.domNode.classList.add("ww-font-size-" + value);
                            }
                        } else {
                            super.format(name, value);
                        }
                    }

                    optimize(context) {
                        super.optimize(context);

                        // if (this.children.length === 1) {
                        const child = this.children.head;
                        const attributes = child.attributes;

                        if (attributes && attributes.attributes.color) {
                            const color = attributes.attributes.color.value(child.domNode);
                            super.format("li-color", color);
                        }

                        if (attributes && attributes.attributes.font) {
                            const font = attributes.attributes.font.value(child.domNode);
                            super.format("li-font", font);
                        }

                        if (attributes && attributes.attributes.fontSize) {
                            const fontSize = attributes.attributes.fontSize.value(child.domNode);
                            if (!this.domNode.classList.contains("ww-font-size-" + fontSize)) {
                                this.format("li-size", fontSize);
                            }
                        }
                        // }
                        // else {
                        //     if (this.attributes.attributes.hasOwnProperty('li-color')) {
                        //         super.format('li-color', null);
                        //     }
                        //     if (this.attributes.attributes.hasOwnProperty('li-font')) {
                        //         super.format('li-font', null);
                        //     }
                        //     if (this.attributes.attributes.hasOwnProperty('li-size')) {
                        //         super.format('li-size', null);
                        //     }
                        // }
                    }
                }
                Quill.register(ListItemStyle);

                // WWLINK
                class WwLink extends Inline {
                    static create(value) {
                        const node = super.create(value);

                        if (typeof value == "object" && value.wwLink) {
                            value = value.wwLink;
                        }

                        node.setAttribute("data-ww-link", value);

                        const valueObject = JSON.parse(value);
                        const linkType = Object.keys(valueObject)[0];
                        let linkText = "";
                        switch (linkType) {
                            case "linkExt":
                                linkText = valueObject[linkType];
                                break;
                            case "linkPage":
                                const pageId = valueObject[linkType];
                                let pageName = "Unknown";
                                for (const page of wwLib.wwWebsiteData.getPages()) {
                                    if (page.id == pageId) {
                                        pageName = page.name;
                                    }
                                }
                                linkText = "Page : " + pageName;
                                break;
                            case "linkSection":
                                const sectionId = valueObject[linkType];
                                let sectionName = "Unknown";
                                for (const _section of wwLib.wwWebsiteData.getCurrentPage().sections) {
                                    const section = wwLib.$store.getters["websiteData/getSection"](_section.id);
                                    if (section.linkId == sectionId) {
                                        sectionName = section.sectionTitle;
                                    }
                                }
                                linkText = "Section : " + sectionName;
                                break;
                            case "linkFile":
                                linkText = "File : " + valueObject[linkType].split("/")[valueObject[linkType].split("/").length - 1];
                                break;
                            case "linkClosePopup":
                                linkText = "Close Popup";
                                break;
                        }

                        node.setAttribute("data-link", linkText);

                        //linkExt / url
                        //linkPage / id
                        //linkSection / id
                        //linkFile / url
                        //linkClosePopup / true

                        return node;
                    }

                    static formats(node) {
                        return {
                            wwLink: node.getAttribute("data-ww-link"),
                        };
                    }

                    // get value of the node (for implement undo function)
                    static value(node) {
                        return node.getAttribute("data-ww-link") || "";
                    }
                }
                WwLink.blotName = "ww-link-inline";
                WwLink.tagName = "SPAN";
                WwLink.className = "ww-link-inline";
                WwLink.allowedChildren = [TextBlot, Inline, Break, Cursor];
                Quill.register(WwLink, true);

                // FONT SIZE
                let configFontSize = { scope: Parchment.Scope.INLINE };
                let fontSize = new Parchment.Attributor.Class("fontSize", "ww-font-size", configFontSize);
                Quill.register(fontSize, true);

                // FONT
                let configFont = { scope: Parchment.Scope.INLINE };
                let font = new Parchment.Attributor.Style("font", "font-family", configFont);
                Quill.register(font, true);

                // ALIGN
                let configAlign = { scope: Parchment.Scope.BLOCK };
                let align = new Parchment.Attributor.Style("align", "text-align", configAlign);
                Quill.register(align, true);

                // INDENT
                let configIndent = { scope: Parchment.Scope.BLOCK };
                let indent = new Parchment.Attributor.Style("indent", "padding-left", configIndent);
                Quill.register(indent, true);

                // LETTER SPACING
                let configLetterSpacing = { scope: Parchment.Scope.INLINE };
                let letterSpacing = new Parchment.Attributor.Style("letterSpacing", "letter-spacing", configLetterSpacing);
                Quill.register(letterSpacing, true);

                // LINE HEIGHT
                let configLineHeight = { scope: Parchment.Scope.BLOCK };
                let lineHeight = new Parchment.Attributor.Style("lineHeight", "line-height", configLineHeight);
                Quill.register(lineHeight, true);

                // FONT WEIGHT
                let configFontWeight = { scope: Parchment.Scope.INLINE };
                let fontWeight = new Parchment.Attributor.Style("fontWeight", "font-weight", configFontWeight);
                Quill.register(fontWeight, true);

                // LIST TYPE
                let configListType = { scope: Parchment.Scope.BLOCK };
                let listType = new Parchment.Attributor.Attribute("listType", "type", configListType);
                Quill.register(listType, true);
            }
        },

        getTextFromDom(format) {
            function _format(node, level) {
                var indentBefore = new Array(level++ + 1).join("    "),
                    indentAfter = new Array(level - 1).join("   "),
                    textNode;

                for (var i = 0; i < node.children.length; i++) {
                    textNode = document.createTextNode("\n" + indentBefore);
                    node.insertBefore(textNode, node.children[i]);

                    format(node.children[i], level);

                    if (node.lastElementChild == node.children[i]) {
                        textNode = document.createTextNode("\n" + indentAfter);
                        node.appendChild(textNode);
                    }
                }

                return node;
            }

            function getText(node, newNode, isChild) {
                if (!node) {
                    return;
                }

                const attrsToRemove = [];
                for (const attr of newNode.attributes) {
                    if (attr.name.indexOf("data-v-") === 0) {
                        attrsToRemove.push(attr.name);
                    } else if (!attr.value) {
                        attrsToRemove.push(attr.name);
                    }
                }
                for (const attrName of attrsToRemove) {
                    newNode.removeAttribute(attrName);
                }

                for (let i = 0; i < node.childNodes.length; i++) {
                    if (!node.childNodes[i] || !node.childNodes[i].nodeName) {
                        continue;
                    }

                    if (node.childNodes[i].nodeName.toLowerCase() == "#text") {
                        newNode.append(node.childNodes[i].cloneNode(false));
                    } else if (node.childNodes[i].classList && node.childNodes[i].classList.contains("ww-object-embed")) {
                        newNode.append(document.createTextNode("[[wwObject=" + node.childNodes[i].attributes["data-ww-object-id"].nodeValue + "]]"));
                    } else if (node.childNodes[i].classList && node.childNodes[i].classList.contains("ww-link-inline")) {
                        // const text = node.childNodes[i].innerHTML;
                        // const text = getText(node.childNodes[i], newNode.childNodes[newNode.childNodes.length - 1], true);
                        const txt = document.createElement("textarea");
                        txt.innerHTML = node.childNodes[i].innerHTML;
                        const text = txt.value;
                        newNode.append(document.createTextNode("[[wwLink=" + node.childNodes[i].attributes["data-ww-link"].nodeValue + "|text=" + text + "]]"));
                    } else if (node.childNodes[i].classList && node.childNodes[i].classList.contains("line")) {
                        try {
                            const value = JSON.parse(node.childNodes[i].attributes["data-line"].nodeValue);
                            const lineNode = document.createElement("span");
                            lineNode.classList.add("line");
                            lineNode.setAttribute("data-line", node.childNodes[i].attributes["data-line"].nodeValue);

                            lineNode.style.lineHeight = (value.height || 1) + "px";
                            lineNode.style.width = value.width || "100%";
                            lineNode.style.display = "inline-block";
                            lineNode.style.borderTop = (value.height || 1) + "px solid " + (value.color || "black");
                            lineNode.style.margin = "2px 0";

                            newNode.append(lineNode);
                        } catch (error) {
                            console.log(error);
                        }
                    } else {
                        newNode.append(node.childNodes[i].cloneNode(false));
                        getText(node.childNodes[i], newNode.childNodes[newNode.childNodes.length - 1], true);
                    }
                }

                if (!isChild) {
                    if (format) {
                        return _format(newNode, 0).innerHTML;
                    } else {
                        return newNode.innerHTML;
                    }
                }
            }

            const newNode = document.createElement("div");

            let elem = this.$el;
            if (this.$el.querySelector(".ql-editor")) {
                elem = this.$el.querySelector(".ql-editor");
            } else if (this.$el.querySelector(".ww-text-content")) {
                elem = this.$el.querySelector(".ww-text-content");
            }

            let t = getText(elem.cloneNode(true), newNode);
            return t;
        },

        async saveText(options) {
            options = options || {};

            if (options.clearRender) {
                this.clearRender = true;
            }
            if (!this.d_edited) {
                return;
            }
            this.d_edited = false;
            wwLib.wwObjectMenu.preventNextOpen();

            wwLib.wwObjectEditors.close(this.textBar);

            let newText = this.getTextFromDom();

            wwLib.wwObjectHover.removeLock();
            // wwLib.wwObjectHover.close();

            wwLib.wwLang.setText(this.wwObject.content.data.text, newText, options.lang);

            await this.wwObjectCtrl.update(this.wwObject);
        },

        /*
        getSelection() {
            let selection = null;
            if (window.getSelection) {
                try {
                    var sel = window.getSelection && window.getSelection();
                    if (sel && sel.rangeCount > 0) {
                        selection = sel.getRangeAt(0);
                    }
                } catch (error) {
                    console.log(error);
                    return null;
                }
            }
            return selection;
        },
        */
        /*
        updateSelection(event) {
            if (document.activeElement == this.$el) {
                this.textSelection = this.getSelection();
            }
        },
        */
        /*
        reselect() {
            let selection = window.getSelection();
            selection.removeAllRanges();
            if (this.textSelection) {
                let textSelection = this.textSelection
                selection.addRange(textSelection);
            }
        },
        */

        wwTextBarAction(options, event) {
            const category = options.split(":")[0];
            const action = options.split(":").length > 1 ? options.split(":")[1] : null;
            const value = options.split(":").length > 2 ? options.split(":")[2] : null;

            this.$nextTick(function() {
                //this.reselect();

                console.log(category);

                switch (category) {
                    // case 'style':
                    //     this.editStyle(action, value);
                    //     break;
                    case "link":
                        this.addLink();
                        break;
                    case "insertWwObject":
                        this.insertWwObject();
                        break;
                    case "exec":
                        this.exec(action, value);
                        break;
                    case "list":
                        this.setList(action);
                        break;
                    case "indent":
                        this.setIndent(action);
                        break;
                    case "fontSize":
                        this.setFontSize(action);
                        break;
                    case "fontStyle":
                        this.setFontStyle(action);
                        break;
                    case "fontWeight":
                        this.setFontWeight(action);
                        break;
                    case "removeFormat":
                        this.removeFormat();
                        break;
                    case "format":
                        this.copyFormat();
                        break;
                    case "prop":
                        this.setProp(action, value);
                        break;
                    case "color":
                        this.setColor(action);
                        break;
                    case "open":
                        this.openPopup(action);
                        break;

                    // case 'insert':
                    //     this.insert(action, value)
                    //     break;
                    // case 'clear':
                    //     this.clear()
                    //     break;
                    // case 'reset':
                    //     this.reset()
                    //     break;
                    case "html":
                        this.editHTML();
                        break;
                    case "openMenu":
                        this.openMenu(event);
                        break;
                    default:
                        break;
                }
            });
        },

        getHoverTag() {
            switch (this.wwObject.content.data.tag) {
                case "h1":
                    return "ww-text-hover-h1";
                    break;
                case "h2":
                    return "ww-text-hover-h2";
                    break;
                case "h3":
                    return "ww-text-hover-h3";
                    break;
                case "h4":
                    return "ww-text-hover-h4";
                    break;
                default:
                    return "";
                    break;
            }
        },

        /*=============================================m_ÔÔ_m=============================================\
          TEXT BAR FUNCTIONS
        \================================================================================================*/
        /*
        reset() {
            this.$el.innerHTML = '';
            wwLib.wwLang.setText(this.wwObject.content.data.text, '');
        },
        */
        /*
        clear() {
            if (this.textSelection.toString().length !== 0) {
                this.replaceSelectionWithHtml(window.getSelection().toString())
            }
            else {
                this.$el.innerHTML = this.$el.innerText;
            }
        },
        */
        /*
        insert(action, value) {
            switch (action) {
                case 'hr':
                    switch (value) {
                        case 'small':
                            document.execCommand("insertHTML", false, '<hr width="25%">');
                            break;
                        case 'medium':
                            document.execCommand("insertHTML", false, '<hr width="50%">');
                            break;
                        case 'big':
                            document.execCommand("insertHTML", false, '<hr width="100%">');
                            break;
                    }
                    break;
            }
        },
        */
        /*
        editStyle(action, value) {

            switch (action) {
                case 'size':
                    let sizes = {
                        xsmall: 0.6,
                        small: 1,
                        medium: 1.5,
                        big: 2,
                        xbig: 3,
                    }

                    let size = sizes[value] || parseFloat(value);

                    this.setStyle('font-size', size + 'rem');
                    break;
                case 'color':
                    this.setColor(value);

                    break;
                case 'align':
                    //this.setStyle('text-align', value);
                    this.setAlign(value);
                    break;
                case 'font':
                    this.setFont(value);
                    break;
            }

        },
        */

        checkSelection() {
            const selection = {
                index: this.quill.getSelection().index,
                length: this.quill.getSelection().length,
            };

            if (!selection.length) {
                this.quill.setSelection(0, this.quill.getLength());
            }
        },

        async exec(cmd, value) {
            if (typeof value === "undefined" || value === null) {
                value = this.quill.getFormat()[cmd] ? false : true;
            }

            switch (cmd) {
                case "color":
                    if (value == "more") {
                        let options = {
                            firstPage: "COLOR_PICKER",
                        };

                        try {
                            const result = await wwLib.wwPopups.open(options);

                            if (typeof result.color) {
                                value = result.color;
                            } else {
                                return;
                            }
                        } catch (error) {}
                    }
                    break;
            }

            this.checkSelection();

            this.quill.format(cmd, value);
        },

        setList(value) {
            let currentFormat = this.quill.getFormat()["list"];

            if (currentFormat == value) {
                this.exec("list", null);
            } else {
                this.exec("list", value);
            }
        },

        setIndent(direction) {
            let currentFormat = this.quill.getFormat()["indent"];

            let newValue = 0;

            if (currentFormat) {
                newValue = parseInt(currentFormat.replace("px", ""));
            }

            if (direction == "left") {
                newValue += 50;
            } else {
                newValue -= 50;
            }

            newValue = Math.max(newValue, 0);
            this.exec("indent", newValue ? newValue + "px" : false);
        },

        setProp(prop, value) {
            this.saveText({ clearRender: true });
            this.wwObject.content.data[prop] = value;

            this.wwObjectCtrl.update(this.wwObject);

            this.reloadQuill();

            wwLib.wwObjectHover.removeLock();
            wwLib.wwObjectHover.close();

            this.$nextTick(() => {
                wwLib.wwObjectHover.setMain(this.$parent);
                wwLib.wwObjectHover.setLock(this.$parent);
            });
        },

        setFontSize(value) {
            this.checkSelection();
            this.quill.format("fontSize", value);
        },

        setFontWeight(value) {
            this.checkSelection();
            if (parseInt(value) == 700) {
                this.quill.format("fontWeight", null);
                this.quill.format("bold", true);
            } else {
                this.quill.format("bold", false);
                this.quill.format("fontWeight", value);
            }
        },

        removeFormat() {
            this.checkSelection();
            this.quill.removeFormat(this.quill.getSelection().index, this.quill.getSelection().length);
        },

        copyFormat() {
            let copiedFormat = null;

            try {
                copiedFormat = localStorage.getItem("ww-text-copied-format");
                copiedFormat = JSON.parse(copiedFormat);
            } catch (error) {}

            if (copiedFormat) {
                this.removeFormat();

                for (let key in copiedFormat) {
                    this.quill.format(key, copiedFormat[key]);
                }

                localStorage.removeItem("ww-text-copied-format");
            } else {
                localStorage.setItem("ww-text-copied-format", JSON.stringify(this.quill.getFormat()));
            }
        },

        insertWwObject() {
            const cursorPosition = this.quill.getSelection().index;
            this.quill.insertEmbed(cursorPosition, "ww-object-embed", "");
            this.quill.setSelection(cursorPosition + 1);

            this.$nextTick(this.saveText);
        },

        insertLine(value) {
            const cursorPosition = this.quill.getSelection().index;
            this.quill.insertEmbed(cursorPosition, "line", JSON.stringify(value));
            this.quill.setSelection(cursorPosition + 1);
        },

        setColor(value) {
            this.checkSelection();
            this.quill.format("color", value);
        },

        setFontStyle(value) {
            this.saveText({ clearRender: true });
            this.wwObject.content.data.fontStyle = value;

            this.wwObjectCtrl.update(this.wwObject);

            this.reloadQuill();

            wwLib.wwObjectHover.removeLock();
            wwLib.wwObjectHover.close();

            this.$nextTick(() => {
                wwLib.wwObjectHover.setMain(this.$parent);
                wwLib.wwObjectHover.setLock(this.$parent);
            });
        },

        /*
        removeTags(tag, style) {

            let str = this.$el.innerHTML;

            let startReg = new RegExp('<' + tag + (style ? ' style="' + style + '=' : '') + '[^\>]*>');
            let startFalse = '<' + tag
            let end = '</' + tag + '>'

            let matches;
            while (matches = startReg.exec(str)) {

                let level = 0;

                let startIndex = matches.index;
                let startLength = matches[0].length;
                let endIndex = -1;

                for (let i = startIndex + startLength; i < str.length; i++) {
                    if (str.substr(i).indexOf(startFalse) === 0) {
                        level++;
                        continue;
                    }
                    if (level != 0 && str.substr(i).indexOf(end) === 0) {
                        level--;
                        continue;
                    }
                    if (level == 0 && str.substr(i).indexOf(end) === 0) {
                        endIndex = i;
                        break;
                    }
                }

                str = str.substr(0, startIndex) + str.substr(startIndex).replace(startReg, '')
                str = str.substr(0, endIndex - startLength) + str.substr(endIndex - startLength).replace(end, '')
            }

            if (str) {
                this.$el.innerHTML = str;
            }

        },
        */
        /*
        removeStyles(style, root) {
            root = root || this.$el;

            if (!root.children || !root.children.length) {
                return;
            }
            else {
                for (let child of root.children) {
                    child.style[style] = '';
                    this.removeStyles(style, child);
                }
            }
        },
        */
        /*
        setStyle(style, value) {

            if (!this.textSelection || this.textSelection.toString().length == 0) {
                this.selectAll();
            }

            let html = this.getSelectionHtml();

            const start = '<span style="' + style + ':' + value + '">';
            const end = '</span>';

            const reg = new RegExp('<span style="' + style + ':[^\"]*">(.*?)<\/span>');

            let m;
            while (m = reg.exec(html)) {
                if (m && m[1]) {
                    html = html.replace(m[0], m[1]);
                }
            }

            html = start + html + end;

            this.replaceSelectionWithHtml(html);
        },
        */
        /*
        setAlign(value) {
            switch (value) {
                case 'justify':
                    document.execCommand('justifyFull', false, 'span');
                    break;
                case 'center':
                    document.execCommand('justifyCenter', false, 'span');
                    break;
                case 'left':
                    document.execCommand('justifyLeft', false, 'span');
                    break;
                case 'right':
                    document.execCommand('justifyRight', false, 'span');
                    break;
            }
        },
        */
        /*
        setFont(value) {
            if (!this.textSelection || this.textSelection.toString().length == 0) {
                this.selectAll();
            }
            document.execCommand('fontName', false, value);
        },
        */

        /*
        async setColor(value) {


            if (!this.textSelection || this.textSelection.toString().length == 0) {
                this.selectAll();
            }

            switch (value) {
                case 'more':

                    let options = {
                        firstPage: 'COLOR_PICKER'
                    }

                    try {
                        const result = await wwLib.wwPopups.open(options)

                        if (typeof (result.color)) {
                            this.setColor(result.color)
                        }
                    } catch (error) {

                    }

                    break;
                default:
                    document.execCommand('foreColor', false, value);
                    break;
            }
        },
        */

        async addLink() {
            if (!this.quill.getSelection().length) {
                return alert("Selectionnez du texte pour inserer un lien.");
            }

            let result = await wwLib.wwPopups.open({
                firstPage: "WWTEXT_LINKS",
            });

            if (!result) {
                return;
            }

            this.quill.format("ww-link-inline", JSON.stringify(result));
        },

        /*
        replaceSelectionWithHtml(html) {

            let localrange;
            if (window.getSelection && window.getSelection().getRangeAt) {
                localrange = this.getSelection();
                localrange.deleteContents();
                const div = document.createElement("div");
                div.innerHTML = html;
                const frag = document.createDocumentFragment()
                let child;
                while ((child = div.firstChild)) {
                    frag.appendChild(child);
                }
                localrange.insertNode(frag);
            } else if (document.selection && document.selection.createRange) {
                localrange = document.selection.createRange();
                localrange.pasteHTML(html);
            }

        },
        */
        /*
        getSelectionHtml() {
            var html = "";
            if (typeof window.getSelection != "undefined") {
                var sel = window.getSelection();
                if (sel.rangeCount) {
                    var container = document.createElement("div");
                    for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                        container.appendChild(sel.getRangeAt(i).cloneContents());
                    }
                    html = container.innerHTML;
                }
            } else if (typeof document.selection != "undefined") {
                if (document.selection.type == "Text") {
                    html = document.selection.createRange().htmlText;
                }
            }
            return html;
        },
        */
        /*
        selectAll() {
            var node = this.$el;

            if (document.selection) {
                var range = document.body.createTextRange();
                range.moveToElementText(node);
                range.select();
            } else if (window.getSelection) {
                var range = document.createRange();
                range.selectNodeContents(node);
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(range);
            }

            this.textSelection = this.getSelection();
        },
        */
        /*
        addWwObject() {
            const newWwObject = wwLib.wwObject.getDefault({ type: 'ww-button' });

            this.wwObject.content.data.children = this.wwObject.content.data.children || [];

            //Find first empty index in current wwObject children
            let index = 0;
            while (this.wwObject.content.data.children[index]) {
                index++;
            }

            this.wwObject.content.data.children[index] = newWwObject;

            this.replaceSelectionWithHtml('[[wwObject=' + index + ']]');

            let newText = this.getTextFromDom();

            this.clearRender = true;

            wwLib.wwLang.setText(this.wwObject.content.data.text, newText);
            this.wwObjectCtrl.update(this.wwObject);
        },
        */

        async openPopup(popup) {
            const selection = this.quill.getSelection();

            let options = {
                firstPage: popup,
                data: {
                    fontStyle: this.quill.getFormat(selection && selection.index ? selection.index : 0, 1),
                },
            };

            try {
                const result = await wwLib.wwPopups.open(options);
                wwLib.wwObjectEditors.close(this.textBar);
                wwLib.wwObjectEditors.add(this.textBar);
            } catch (error) {
                console.log(error);
            }
        },

        async openMenu(event) {
            this.saveText();

            wwLib.wwObjectEditors.close(this.textBar);
            this.wwObjectCtrl.context.openMenu(event, true, true);
        },

        async editHTML() {
            wwLib.wwObjectHover.setLock(this);

            wwLib.wwPopups.addStory("WWTEXT_HTML", {
                title: {
                    en: "Edit HTML",
                    fr: "Editer le HTML",
                },
                type: "wwTextPopupHtml",
                buttons: null,
                storyData: {},
                buttons: {
                    NEXT: {
                        text: {
                            en: "Ok",
                            fr: "Ok",
                        },
                        next: false,
                    },
                },
            });

            let options = {
                firstPage: "WWTEXT_HTML",
                data: {
                    wwObject: this.wwObject,
                    html: this.getTextFromDom(),
                },
            };

            try {
                const result = await wwLib.wwPopups.open(options);

                if (result && typeof result.html !== undefined) {
                    await this.replaceText(result.html);
                }
            } catch (error) {
                console.log(error);
            }

            wwLib.wwObjectHover.removeLock();
        },

        async replaceText(text, lang) {
            this.clearRender = true;

            wwLib.wwLang.setText(this.wwObject.content.data.text, text, lang);

            await this.wwObjectCtrl.update(this.wwObject);

            this.reloadQuill();
        },

        async edit() {
            wwLib.wwObjectHover.setLock(this);

            wwLib.wwPopups.addStory("WWTEXT_EDIT", {
                title: {
                    en: "Edit Text",
                    fr: "Editer le texte",
                },
                type: "wwPopupEditWwObject",
                buttons: null,
                storyData: {
                    list: {},
                },
            });

            let options = {
                firstPage: "WWTEXT_EDIT",
                data: {
                    wwObject: this.wwObject,
                },
            };

            try {
                const result = await wwLib.wwPopups.open(options);

                this.wwObjectCtrl.globalEdit(result);
            } catch (error) {
                console.log(error);
            }

            wwLib.wwObjectHover.removeLock();
        },

        setFocus(focusId) {
            const oldFocus = this.focus;
            this.focus = focusId == this.$parent._uid;

            if (this.focus) {
                this.d_edited = true;
                wwLib.wwObjectMenu.allowNextOpen && wwLib.wwObjectMenu.allowNextOpen();
                wwLib.wwObjectEditors.add(this.textBar);
                wwLib.wwObjectMargins.close();

                if (this.editingSection && this.quill) {
                    this.quill.enable();
                }

                // document.removeEventListener('selectionchange', this.updateSelection);
                // document.addEventListener('selectionchange', this.updateSelection);

                setTimeout(() => {
                    wwLib.wwObjectHover.removeLock();
                    wwLib.wwObjectHover.setMain(this.$parent);
                    wwLib.wwObjectHover.setLock(this.$parent);

                    // if (this.$el.classList.contains('ww-text-content')) {
                    //     this.$el.focus();
                    // }
                    // else if (this.$el.querySelector('.ww-text-content')) {
                    //     this.$el.querySelector('.ww-text-content').focus();
                    // }
                    // else {

                    // }
                }, 50);
            } else if (oldFocus) {
                // document.removeEventListener('selectionchange', this.updateSelection);

                this.saveText();

                if (this.quill) {
                    this.quill.disable();
                }
                wwLib.wwObjectEditors.close(this.textBar);
            }
        },

        async beforeSave() {
            this.clearRender = true;
            await this.saveText();
            this.quill = null;
        },

        beforeCancel() {
            wwLib.wwObjectHover.removeLock();
            this.clearRender = true;
            this.quill = null;
            this.$forceUpdate();
        },

        /* wwManager:end */
    },
    created() {
        /* wwManager:start */
        let needUpdate = false;
        if (this.wwObject.content.data.text.fr_FR) {
            this.wwObject.content.data.text.fr = this.wwObject.content.data.text.fr_FR;
            delete this.wwObject.content.data.text.fr_FR;
            needUpdate = true;
        }
        if (this.wwObject.content.data.text.en_GB) {
            this.wwObject.content.data.text.en = this.wwObject.content.data.text.en_GB;
            delete this.wwObject.content.data.text.en_GB;
            needUpdate = true;
        }
        if (needUpdate) {
            this.wwObjectCtrl.update(this.wwObject);
        }
        /* wwManager:end */
    },
    mounted() {
        this.init();

        this.$emit("ww-loaded", this);

        /* wwManager:start */
        this.textBar = {
            context: this,
            type: "wwTextBar",
            component: wwTextBar,
        };

        this.$el.addEventListener("paste", (e) => {
            e.preventDefault();

            // get text representation of clipboard
            let text = (e.originalEvent || e).clipboardData.getData("text/plain");

            // text = this._correctText(text)

            // var delta = this.quill.clipboard.convert(html);
            // console.log(delta);

            // // insert text manually
            // this.quill.pasteHTML(html);

            // this.quill.deleteText(this.quill.getSelection().index, this.quill.getSelection().length);

            setTimeout(() => {
                // var tmp = document.createElement("DIV");
                // tmp.innerHTML = text;
                // text = tmp.innerHTML || tmp.innerHTML || "";

                // console.log(text);
                document.execCommand("insertHTML", false, text);
                // this.quill.pasteHTML(text);
            }, 1);

            // this.quill.clipboard.dangerouslyPasteHTML(0, text);
        });

        wwLib.$on("wwFocus", this.setFocus);

        wwLib.wwAsyncScripts.loadAsset({
            target: "manager",
            name: "ww-text",
        });

        wwLib.$on("wwLang:changed", (lang) => {
            this.saveText({ lang: lang.old });

            this.clearRender = true;

            setTimeout(() => {
                if (this.editingSection) {
                    this.loadQuill();
                }
            }, 100);
        });

        /* wwManager:end */
    },
    beforeDestroy() {
        /* wwManager:start */
        this.saveText();
        wwLib.$off("wwFocus", this.setFocus);

        wwLib.wwObjectEditors.close(this.textBar);
        /* wwManager:end */
    },
};
</script>

<style scoped lang="scss">
.ww-text {
    display: inline-block;
    width: 100%;
    overflow-wrap: break-word;
    -webkit-line-break: after-white-space;
    outline: none;
    white-space: pre-wrap;
}

.no-text {
    color: grey;
}

.no-select {
    user-select: none;
}

/*=============================================m_ÔÔ_m=============================================\
  STYLES
\================================================================================================*/
h1,
h2,
h3,
h4 {
    font-size: inherit;
    font-weight: inherit;
    margin: 0;
}
</style>

<style lang="scss">
.ww-text {
    ol,
    ul {
        margin: 0;
    }

    a {
        text-decoration: none;
        color: inherit;
    }
    p {
        margin: 0;
        white-space: pre-wrap;
    }

    .ww-object,
    .ww-object-embed {
        font-size: initial;
        font-weight: initial;
        line-height: initial;
        letter-spacing: initial;
        white-space: initial;
        vertical-align: middle;
        display: inline-block;
    }

    .ww-object-wrapper {
        display: inline-block;
    }

    .ww-link-inline {
        position: relative;

        &:before {
            content: "";
            position: absolute;
            border: 1px dashed #2e86c2;
            top: -2px;
            left: -2px;
            bottom: -2px;
            right: -2px;
            pointer-events: none;
        }

        &:after {
            content: attr(data-link);
            position: absolute;
            top: -2px;
            left: -2px;
            transform: translateY(-100%);
            padding: 2px;
            background-color: #2e86c2;
            display: none;
            font-size: 9px;
            color: white;
            white-space: nowrap;
        }

        &:hover {
            &:after {
                display: block;
            }
        }
    }

    // .ww-object {
    //     margin: 1px;
    // }
}

.ww-text-link {
    text-decoration: none;
    color: inherit;
}

.ql-clipboard {
    display: none;
}

/* wwManager:start */
/*=============================================m_ÔÔ_m=============================================\
  HOVER CLASSES
\================================================================================================*/
.ww-text-hover-h1 {
    &::after {
        content: "h1";
        position: absolute;
        right: 0;
        bottom: 0;
        background-color: #2e86c2;
        color: white;
        padding: 3px 3px 2px 8px;
        border-top-left-radius: 10px;
        font-size: 15px;
        font-family: arial;
    }
}
.ww-text-hover-h2 {
    &::after {
        content: "h2";
        position: absolute;
        right: 0;
        bottom: 0;
        background-color: #2e86c2;
        color: white;
        padding: 3px 3px 2px 8px;
        border-top-left-radius: 10px;
        font-size: 15px;
        font-family: arial;
    }
}
.ww-text-hover-h3 {
    &::after {
        content: "h3";
        position: absolute;
        right: 0;
        bottom: 0;
        background-color: #2e86c2;
        color: white;
        padding: 3px 3px 2px 8px;
        border-top-left-radius: 10px;
        font-size: 15px;
        font-family: arial;
    }
}
.ww-text-hover-h4 {
    &::after {
        content: "h4";
        position: absolute;
        right: 0;
        bottom: 0;
        background-color: #2e86c2;
        color: white;
        padding: 3px 3px 2px 8px;
        border-top-left-radius: 10px;
        font-size: 15px;
        font-family: arial;
    }
}
/* wwManager:end */
</style>
