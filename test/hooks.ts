import Hooks from '../src/hooks';

describe('hooks', () => {
    const mockFunction = jest.fn();

    afterEach(() => {
        Hooks.clear();
    });

    it('registers a hook callback to be executed later', async () => {
        Hooks.register('test', mockFunction);
        expect(Hooks.get('test')?.length).toEqual(1);
    });

    it('executes a hook', () => {
        Hooks.register('test', mockFunction);
        Hooks.execute('test');
        expect(mockFunction).toHaveBeenCalledTimes(1);
    });

    it('does not execute a hook if hook is not defined', () => {
        Hooks.execute('test');
        expect(mockFunction).toHaveBeenCalledTimes(1);
    });

    it('removes a hook', async () => {
        Hooks.clear('test');
        expect(Hooks.get('test')).toEqual(null);

        Hooks.register('test', mockFunction);
        Hooks.clear('test');
        expect(Hooks.get('test')).toEqual([]);
    });

    it('clears all hooks without passing a key', async () => {
        Hooks.register('test1', jest.fn());
        Hooks.register('test2', jest.fn());
        Hooks.register('test3', jest.fn());
        Hooks.clear();
        expect(Hooks.list()).toBeEmptyObject();
    });
});
