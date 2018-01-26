/**
 * Event
 *
 * @export
 * @interface IEvent
 */
export default interface IEvent {
    [key: string]: (n: any) => any;
}
