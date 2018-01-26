import IFile from './file';
/**
 * Media source type
 *
 * @export
 * @interface IType
 */
export default interface IType {
    media: IFile;
    promise: Promise<any>;
}
