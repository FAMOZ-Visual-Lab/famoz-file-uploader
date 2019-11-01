import themes from "./theme";
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
    html,
    body,
    div,
    span,
    applet,
    object,
    iframe,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    p,
    blockquote,
    pre,
    a,
    abbr,
    acronym,
    address,
    big,
    cite,
    code,
    del,
    dfn,
    em,
    img,
    ins,
    kbd,
    q,
    s,
    samp,
    small,
    strike,
    strong,
    sub,
    sup,
    tt,
    var,
    b,
    u,
    i,
    center,
    dl,
    dt,
    dd,
    ol,
    ul,
    li,
    fieldset,
    form,
    label,
    legend,
    table,
    caption,
    tbody,
    tfoot,
    thead,
    tr,
    th,
    td,
    article,
    aside,
    canvas,
    details,
    embed,
    figure,
    figcaption,
    footer,
    header,
    hgroup,
    menu,
    nav,
    output,
    ruby,
    section,
    summary,
    time,
    mark,
    audio,
    video {
        margin: 0;
        padding: 0;
        border: 0;
        font: inherit;
        font-size: 16px;
        font-size: 1.6rem;
        vertical-align: baseline;
        box-sizing: border-box;        
    }

    /* HTML5 display-role reset for older browsers */
    article,
    aside,
    details,
    figcaption,
    figure,
    footer,
    header,
    hgroup,
    menu,
    nav,
    section {
        display: block;
    }

    html {
        font-size: 62.5%
    }

    * {
        &::-webkit-scrollbar-track {
            border-radius: 10px;
            background-color: transparent;
            cursor: pointer;
        }
        &::-webkit-scrollbar {
            width: 5px;
            background-color: transparent;
            border-radius: 10px;
            cursor: pointer;
        }
        &::-webkit-scrollbar-thumb {
            border-radius: 10px;
            background-color: gray;
            margin-left: -5rem;
            cursor: pointer;
            overflow: hidden;
        }
    }

    body {
        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none;   /* Chrome/Safari/Opera */
        -khtml-user-select: none;    /* Konqueror */
        -moz-user-select: none;      /* Firefox */
        -ms-user-select: none;       /* Internet Explorer/Edge*/
        user-select: none;          /* Non-prefixed version, currently 
                                        not supported by any browser */
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
        line-height: 1;
        background: white;
        color: ${themes.textColor};
        font-family: "NanumSquare", "sans-serif";

        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;

        overflow-x: hidden;
    }

    ol,
    ul {
        list-style: none;
    }

    blockquote,
    q {
        quotes: none;
    }

    blockquote:before,
    blockquote:after,
    q:before,
    q:after {
        content: '';
        content: none;
    }

    table {
        border-collapse: collapse;
        border-spacing: 0;
    }

    a {
        text-decoration: inherit;
        color: inherit;
    }
`;

export default GlobalStyle;
