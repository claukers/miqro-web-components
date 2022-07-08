import {define} from "../esm.bundle.js";
import render from "./index-component.js";

define("my-component", render, {"template":"<p>{text}</p><p>label</p><div><p>\"{text}\\\"</p>\n<p>label</p></div>"});