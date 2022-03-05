import Channel from '../Channel';

describe('Channel', () => {
  it('can parse a message', () => {
    const message = 'Hello this is a message.';
    const channel = Channel.from('', message);

    expect(channel.children).toHaveLength(1);
    expect(channel.children[0].children).toBe(message);
  });

  it('breaks messages on a .', () => {
    const fixture = `
One
.
Two
`.trim();

    const channel = Channel.from('', fixture);
    expect(channel.children).toHaveLength(2);
    expect(channel.children[0].children).toBe('One');
    expect(channel.children[1].children).toBe('Two');
  });

  it('can parse complicated messages', () => {
    const fixture = `
# Heading
Paragraph

.
Third message

# Heading 2
`.trim();

    // Should parse: [Heading, Paragraph, Third, Heading]
    const channel = Channel.from('', fixture);
    expect(channel.children).toHaveLength(4);
  });
});
