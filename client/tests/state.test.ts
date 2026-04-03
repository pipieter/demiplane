/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import State from '../src/state';
import { Token } from '../src/models/token';

describe('State Class', () => {
    let state: State;

    beforeEach(() => {
        state = new State();
    })

    describe('Token Management', () => {
        test('Should add token and emit token_create', () => {
            const mockToken: Token = {
                id: crypto.randomUUID(),
                name: 'Test Token',
                type: "rectangle",
                color: "#ff00ff",
                border: null,
                x: 0,
                y: 0,
                w: 100,
                h: 100,
                r: 0,
            }
            const spy = vi.fn();

            state.listen("token_create", spy);
            state.createToken(mockToken);

            expect(state.getTokens()).toContain(mockToken);
            expect(spy).toHaveBeenCalledWith(mockToken);
        })
    })
})