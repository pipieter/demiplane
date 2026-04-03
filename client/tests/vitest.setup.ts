/* eslint-disable @typescript-eslint/no-explicit-any */
import * as path from "path";
import * as fs from 'fs';
import { beforeEach } from "vitest";

beforeEach(() => {
    /**
     * When running tests, our document is empty. We need it to match our index.html file.\
     * To do so, we read the html file manually and write our document's html to match.
     */
    const htmlPath = path.resolve(__dirname, '../index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    document.documentElement.innerHTML = htmlContent;

    /**
     * Our test-environment (JSDOM) does not implement full SVG specifications.
     * D3-Zoom specifically requires a `viewBox.baseVal` and `width/height.baseVal`
     * For zoom-boundary calculations. Without these getters D3 throws errors.
     */
    const svgProps = {
        viewBox: {
            get() {
                return {
                    baseVal: { x: 0, y: 0, width: 1000, height: 1000 },
                    animVal: { x: 0, y: 0, width: 1000, height: 1000 },
                };
            },
            configurable: true
        },
        width: {
            get() { return { baseVal: { value: 1000 } }; },
            configurable: true
        },
        height: {
            get() { return { baseVal: { value: 1000 } }; },
            configurable: true
        }
    };

    Object.defineProperties(SVGSVGElement.prototype, svgProps);

    /**
     * D3 uses 'getScreenCTM' to translate mouse coordinates into SVG coordinates.
     * Since there is no "screen" in Vitest, we return an 'Identity Matrix' 
     * (a matrix that does no transformation: a:1, d:1).
     */
    (SVGElement.prototype as any).getScreenCTM = () => ({
        a: 1, b: 0, c: 0, d: 1, e: 0, f: 0,
        inverse: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
        multiply: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
    });

    /**
     * Elements in JSDOM have no physical size (width/height is always 0).
     * We mock 'getBBox' to return a dummy size so D3's math doesn't 
     * result in 'NaN' or 'Infinity' when dividing by zero.
     */
    (SVGElement.prototype as any).getBBox = () => ({
        x: 0, y: 0, width: 1000, height: 1000,
        bottom: 1000, left: 0, right: 1000, top: 0,
    });

    /**
     * Some versions of D3 call 'createSVGMatrix' to perform zoom math.
     * We ensure this method exists on the root <svg> element prototype.
     */
    if (!SVGSVGElement.prototype.createSVGMatrix) {
        SVGSVGElement.prototype.createSVGMatrix = () => ({
            a: 1, b: 0, c: 0, d: 1, e: 0, f: 0,
            multiply: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
            inverse: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }),
        } as any);
    }
});