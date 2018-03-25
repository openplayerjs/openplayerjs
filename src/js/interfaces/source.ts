/**
 * Media source
 *
 * @export
 * @interface Source
 */
export default interface Source {
    src: string;
    type: string;
    drm?: object;
}
