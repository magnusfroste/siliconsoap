import { describe, expect, it } from 'vitest';
import { stripSpeakerLabel } from '../speakerLabel';
const names = ['Vivian Sterling', 'Marcel Dufresne', 'Lin Weiyang'];
describe('stripSpeakerLabel', () => {
  it('strips a bracketed label', () => expect(stripSpeakerLabel('[Lin Weiyang]: I disagree.', names)).toBe('I disagree.'));
  it('strips an unbracketed known label and keeps stage directions', () => expect(stripSpeakerLabel('John Bass: *Slams fist on table* No!', ['John Bass'])).toBe('*Slams fist on table* No!'));
  it("strips another agent's name", () => expect(stripSpeakerLabel('[Vivian Sterling]: Fair point.', names)).toBe('Fair point.'));
  it('strips Agent letters', () => expect(stripSpeakerLabel('Agent B: Hello.', [])).toBe('Hello.'));
  it('leaves text without a label', () => expect(stripSpeakerLabel('Markets move fast.', names)).toBe('Markets move fast.'));
  it('keeps names used mid-sentence', () => {
    const t = "You're making a compelling case, Vivian Sterling: but consider this.";
    expect(stripSpeakerLabel(t, names)).toBe(t);
  });
  it('keeps an opening vocative without colon', () => expect(stripSpeakerLabel('Vivian Sterling, you are wrong.', names)).toBe('Vivian Sterling, you are wrong.'));
});
