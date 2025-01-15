---
name: ww-button
description: Configurable button component with styling, icons, and form submission capabilities.
keywords: [button, submit, reset, icon, form, styling]
---

#### ww-button

Purpose: Renders a button element with configurable type, styling, and icon support.

Properties:
- text: string|object - Button text content. Can be an object with {"lang":"text"} format (e.g: {"en":"English text","fr":"French text"})
- backgroundColor: string|null - Text background color
- buttonType: 'button'|'submit'|null - Button type
- disabled: boolean - Disables button
- hasLeftIcon: boolean - Shows left icon
- hasRightIcon: boolean - Shows right icon

Children:
- leftIcon: ww-icon - Left icon with right padding
- rightIcon: ww-icon - Right icon with left padding

Features:
- Inherits ww-text properties
- Action triggering support
- Form submission integration

Events:
- focus: Triggered when button receives focus. No payload.
- blur: Triggered when button loses focus. No payload.

Variables: none