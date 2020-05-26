const listFiles = require('./listFiles');

const client = {
  pulls: {
    listFiles: jest.fn()
  }
};

const run = () => {
  listFiles({
    client,
    owner: 'my-org',
    repo: 'my-repo',
    prNumber: 1,
    storagePath: 'tmp/convert',
    log: () => {},
  });
};

describe('listFiles', () => {
  it('test', async () => {
    client.pulls.listFiles.mockResolvedValue({
      data: {
        my: test
      }
    });
    await run();
  });
});
