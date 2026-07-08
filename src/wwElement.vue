<template>
    <component :is="tag" class="ww-button" :class="{ button: tag, '-link': hasLink && !isEditing }"
        :type="buttonType" :style="buttonStyle" :data-ww-flag="'btn-' + content.buttonType" :disabled="content.disabled"
        v-bind="properties" @focus="isReallyFocused = true" @blur="onBlur($event)" @mousedown="onMouseActivate"
        @mouseup="onMouseDeactivate" @mouseleave="onMouseDeactivate" @touchstart="onTouchActivate"
        @touchend="onTouchDeactivate" @touchcancel="onTouchDeactivate" @keydown.enter="onKeyActivate"
        @keydown.space="onKeyActivate" @keyup.enter="onKeyDeactivate" @keyup.space="onKeyDeactivate"
        @keydown="onKeyDown" @keyup="onKeyUp">
        <wwElement v-if="content.hasLeftIcon && content.leftIcon" v-bind="content.leftIcon"></wwElement>
        <wwText tag="span" :text="text"></wwText>
        <wwElement v-if="content.hasRightIcon && content.rightIcon" v-bind="content.rightIcon"></wwElement>
    </component>
</template>

<script>
import { computed } from 'vue';
const TEXT_ALIGN_TO_JUSTIFY = {
    center: 'center',
    right: 'flex-end',
    left: 'flex-start',
    justify: 'center',
};
export default {
    props: {
        content: { type: Object, required: true },
        wwFrontState: { type: Object, required: true },
        wwElementState: { type: Object, required: true },
        /* wwEditor:start */
        wwEditorState: { type: Object, required: true },
        /* wwEditor:end */
    },
    emits: [
        'update:content',
        'update:content:effect',
        'change-menu-visibility',
        'change-borders-style',
        'trigger-event',
    ],
    setup(props) {
        /* wwEditor:start */
        const { createElement } = wwLib.useCreateElement();
        /* wwEditor:end */
        const {
            hasLink,
            tag: linkTag,
            properties,
        } = wwLib.wwElement.useLink({
            isDisabled: computed(() => props.content.disabled),
        });
        return {
            /* wwEditor:start */
            createElement,
            /* wwEditor:end */
            hasLink,
            linkTag,
            properties,
        };
    },

    data() {
        return {
            isReallyFocused: false,
            isReallyActive: false,
        };
    },
    computed: {
        buttonStyle() {
            return {
                '--ww-button-justify-content': TEXT_ALIGN_TO_JUSTIFY[this.content['_ww-text_textAlign']] || 'center',
            };
        },
        isEditing() {
            /* wwEditor:start */
            return this.wwEditorState.editMode === wwLib.wwEditorHelper.EDIT_MODES.EDITION;
            /* wwEditor:end */
            // eslint-disable-next-line no-unreachable
            return false;
        },
        tag() {
            if (this.isEditing) return 'div';
            if (this.hasLink) {
                return this.linkTag;
            }
            if (
                this.content.buttonType === 'submit' ||
                this.content.buttonType === 'reset' ||
                this.content.buttonType === 'button'
            )
                return 'button';
            return 'div';
        },
        buttonType() {
            if (this.isEditing || this.hasLink) return '';
            if (
                this.content.buttonType === 'submit' ||
                this.content.buttonType === 'reset' ||
                this.content.buttonType === 'button'
            )
                return this.content.buttonType;
            return '';
        },
        text() {
            return this.wwElementState.props.text;
        },
    },
    watch: {
        /* wwEditor:start */
        'content.hasRightIcon': {
            immediate: true,
            async handler(hasRightIcon) {
                if (this.wwEditorState.isACopy) {
                    return;
                }
                if (hasRightIcon && !this.content.rightIcon?.isWwObject) {
                    const content = await this.createElement('ww-icon', {
                        content: {
                            color: "#000000", icon: "lucide/plus"
                        },
                    });
                    this.$emit('update:content:effect', { rightIcon: content });
                }
            },
        },
        'content.hasLeftIcon': {
            immediate: true,
            async handler(hasLeftIcon) {
                if (this.wwEditorState.isACopy) {
                    return;
                }
                if (hasLeftIcon && !this.content.leftIcon?.isWwObject) {
                    const content = await this.createElement('ww-icon', {
                        content: {
                            color: "#000000", icon: "lucide/plus"
                        },
                    });
                    this.$emit('update:content:effect', { leftIcon: content });
                }
            },
        },
        /* wwEditor:end */
        isReallyFocused(isFocused, wasFocused) {
            if (isFocused && !wasFocused) {
                this.$emit('trigger-event', { name: 'focus' });
            } else if (!isFocused && wasFocused) {
                this.$emit('trigger-event', { name: 'blur' });
            }
        },
    },
    methods: {
        /* wwEditor:start */
        selectParentFormContainer() {
            const parentUid = wwLib.selectParentByFlag(this.$el, 'form-container');
            if (!parentUid) {
                wwLib.wwNotification.open({
                    text: {
                        en: 'No parent form container found. Please, add this submit button into a form container.',
                        fr: 'Aucun formulaire parent trouvé. Veuillez intégrer ce bouton submit dans un form container.',
                    },
                    color: 'yellow',
                    duration: 6000,
                });
            }
        },
        /* wwEditor:end */
        onBlur() {
            this.isReallyFocused = false;
        },
        onActivate(event) {
            this.isReallyActive = true;
            // Emit the original event name
            const eventName = event.type;
            this.$emit('trigger-event', { name: eventName, event });
        },
        onDeactivate(event) {
            this.isReallyActive = false;
            // Emit the original event name
            const eventName = event.type;
            this.$emit('trigger-event', { name: eventName, event });
        },
        onTouchActivate() {
            this.isReallyActive = true;
        },
        onTouchDeactivate() {
            this.isReallyActive = false;
        },
        onMouseActivate() {
            this.isReallyActive = true;
        },
        onMouseDeactivate() {
            this.isReallyActive = false;
        },
        onKeyActivate() {
            this.isReallyActive = true;
        },
        onKeyDeactivate() {
            this.isReallyActive = false;
        },
        onKeyDown(event) {
            this.$emit('trigger-event', { name: 'keydown', event });
        },
        onKeyUp(event) {
            this.$emit('trigger-event', { name: 'keyup', event });
        },
    },
};
</script>

<style lang="scss" scoped>
.ww-button {
    justify-content: var(--ww-button-justify-content, center);
    align-items: center;

    &.button {
        appearance: none;
    }

    &.-link {
        cursor: pointer;
    }
}
</style>
