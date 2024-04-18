import ChirpService from '../chirp.js';
import ChirpRepository from '../../repository/chirp/mysql/index.js';
import {
  ErrForbiddenAccess,
  ErrInvalidMessage,
  ErrNotFound,
} from '../../service/errors/index.js';

jest.mock('../../repository/chirp/mysql/index.js');

describe('ChirpService', () => {
  let chirpService;
  let mockChirpRepo;

  beforeEach(() => {
    mockChirpRepo = new ChirpRepository();
    chirpService = new ChirpService({ chirpRepository: mockChirpRepo });
  });

  describe('createChirp', () => {
    const createChirpCases = [
      {
        name: 'should successfully create a chirp and return the chirp details',
        user: { id: 1 },
        message: 'This is a valid chirp message within the acceptable range.',
        setup: () => {
          mockChirpRepo.createChirp.mockResolvedValue(101);
          mockChirpRepo.getChirpWithAuthor.mockResolvedValue([
            {
              id: 101,
              user_id: 1,
              name: 'John Doe',
              email: 'john@example.com',
              message:
                'This is a valid chirp message within the acceptable range.',
              created_at: '2021-01-01T00:00:00Z',
              updated_at: '2021-01-01T00:00:00Z',
            },
          ]);
        },
        expectedError: null,
        expectedOutput: {
          id: 101,
          message: 'This is a valid chirp message within the acceptable range.',
          author: {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
          },
          created_at: '2021-01-01T00:00:00Z',
          updated_at: '2021-01-01T00:00:00Z',
        },
      },
      {
        name: 'should throw ErrInvalidMessage if the message is empty',
        user: { id: 1 },
        message: '',
        expectedError: ErrInvalidMessage,
        expectedOutput: null,
      },
      {
        name: 'should throw ErrInvalidMessage if message length is below minimum (below 10 characters)',
        user: { id: 1 },
        message: 'Too short',
        expectedError: ErrInvalidMessage,
        expectedOutput: null,
      },
      {
        name: 'should throw ErrInvalidMessage if message length exceeds maximum (over 250 characters)',
        user: { id: 1 },
        message: 'L'.repeat(251),
        expectedError: ErrInvalidMessage,
        expectedOutput: null,
      },
      {
        name: 'should throw ErrNotFound if the chirp creation succeeds but the chirp is not found',
        user: { id: 1 },
        message: 'Valid length message that should succeed',
        setup: () => {
          mockChirpRepo.createChirp.mockResolvedValue(100);
          mockChirpRepo.getChirpWithAuthor.mockResolvedValue([]);
        },
        expectedError: ErrNotFound,
        expectedOutput: null,
      },
    ];

    createChirpCases.forEach(
      ({ name, user, message, setup, expectedError, expectedOutput }) => {
        it(name, async () => {
          if (setup) setup(); // Setup mocks if necessary
          if (expectedError) {
            await expect(
              chirpService.createChirp(user, message)
            ).rejects.toThrow(expectedError);
          } else {
            const result = await chirpService.createChirp(user, message);
            expect(result).toEqual(expectedOutput);
          }
        });
      }
    );
  });

  describe('getChirpList', () => {
    const getChirpListCases = [
      {
        name: 'should return an empty array when no chirps are available',
        setup: () => mockChirpRepo.getChirps.mockResolvedValue([]),
        expectedOutput: [],
      },
      {
        name: 'should return a list with a single chirp',
        setup: () =>
          mockChirpRepo.getChirps.mockResolvedValue([
            {
              id: 101,
              user_id: 1,
              name: 'John Doe',
              email: 'john@example.com',
              message: 'Hello World',
              created_at: '2021-01-01T00:00:00Z',
              updated_at: '2021-01-01T00:00:00Z',
            },
          ]),
        expectedOutput: [
          {
            id: 101,
            message: 'Hello World',
            author: {
              id: 1,
              name: 'John Doe',
              email: 'john@example.com',
            },
            created_at: '2021-01-01T00:00:00Z',
            updated_at: '2021-01-01T00:00:00Z',
          },
        ],
      },
      {
        name: 'should return a list with multiple chirps',
        setup: () =>
          mockChirpRepo.getChirps.mockResolvedValue([
            {
              id: 101,
              user_id: 1,
              name: 'John Doe',
              email: 'john@example.com',
              message: 'Hello World',
              created_at: '2021-01-01T00:00:00Z',
              updated_at: '2021-01-01T00:00:00Z',
            },
            {
              id: 102,
              user_id: 2,
              name: 'Jane Doe',
              email: 'jane@example.com',
              message: 'Goodbye World',
              created_at: '2021-01-02T00:00:00Z',
              updated_at: '2021-01-02T00:00:00Z',
            },
          ]),
        expectedOutput: [
          {
            id: 101,
            message: 'Hello World',
            author: {
              id: 1,
              name: 'John Doe',
              email: 'john@example.com',
            },
            created_at: '2021-01-01T00:00:00Z',
            updated_at: '2021-01-01T00:00:00Z',
          },
          {
            id: 102,
            message: 'Goodbye World',
            author: {
              id: 2,
              name: 'Jane Doe',
              email: 'jane@example.com',
            },
            created_at: '2021-01-02T00:00:00Z',
            updated_at: '2021-01-02T00:00:00Z',
          },
        ],
      },
    ];

    getChirpListCases.forEach(({ name, setup, expectedOutput }) => {
      it(name, async () => {
        if (setup) setup(); // Setup mocks if necessary
        const results = await chirpService.getChirpList();
        expect(results).toEqual(expectedOutput);
      });
    });
  });

  describe('getOneChirp', () => {
    const getOneChirpCases = [
      {
        name: 'should successfully retrieve a chirp by ID',
        chirpId: 101,
        setup: () =>
          mockChirpRepo.getChirpWithAuthor.mockResolvedValue([
            {
              id: 101,
              user_id: 1,
              name: 'John Doe',
              email: 'john@example.com',
              message: 'Hello World',
              created_at: '2021-01-01T00:00:00Z',
              updated_at: '2021-01-01T00:00:00Z',
            },
          ]),
        expectedError: null,
        expectedOutput: {
          id: 101,
          message: 'Hello World',
          author: {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
          },
          created_at: '2021-01-01T00:00:00Z',
          updated_at: '2021-01-01T00:00:00Z',
        },
      },
      {
        name: 'should throw ErrNotFound if no chirp with the given ID is found',
        chirpId: 999, // Assuming this ID does not exist
        setup: () => mockChirpRepo.getChirpWithAuthor.mockResolvedValue([]),
        expectedError: ErrNotFound,
        expectedOutput: null,
      },
    ];

    getOneChirpCases.forEach(
      ({ name, chirpId, setup, expectedError, expectedOutput }) => {
        it(name, async () => {
          if (setup) setup(); // Setup mocks if necessary
          if (expectedError) {
            await expect(chirpService.getOneChirp(chirpId)).rejects.toThrow(
              expectedError
            );
          } else {
            const result = await chirpService.getOneChirp(chirpId);
            expect(result).toEqual(expectedOutput);
          }
        });
      }
    );
  });

  describe('editChirp', () => {
    const editChirpCases = [
      {
        name: 'should successfully edit chirp and return updated details',
        user: { id: 1 },
        chirpId: 101,
        message: 'This is an updated valid message within range.',
        setup: () => {
          mockChirpRepo.isUserTheAuthor.mockResolvedValue(true);
          mockChirpRepo.updateChirp.mockResolvedValue();
          mockChirpRepo.getChirpWithAuthor.mockResolvedValue([
            {
              id: 101,
              user_id: 1,
              name: 'John Doe',
              email: 'john@example.com',
              message: 'This is an updated valid message within range.',
              created_at: '2021-01-01T00:00:00Z',
              updated_at: '2021-01-02T00:00:00Z',
            },
          ]);
        },
        expectedError: null,
        expectedOutput: {
          id: 101,
          message: 'This is an updated valid message within range.',
          author: {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
          },
          created_at: '2021-01-01T00:00:00Z',
          updated_at: '2021-01-02T00:00:00Z',
        },
      },
      {
        name: 'should throw ErrInvalidMessage if the message is empty',
        user: { id: 1 },
        chirpId: 101,
        message: '',
        expectedError: ErrInvalidMessage,
        expectedOutput: null,
      },
      {
        name: 'should throw ErrInvalidMessage if message length is below minimum (10 characters)',
        user: { id: 1 },
        chirpId: 101,
        message: 'Short',
        expectedError: ErrInvalidMessage,
        expectedOutput: null,
      },
      {
        name: 'should throw ErrForbiddenAccess if user is not the chirp creator',
        user: { id: 2 }, // Assuming ID 2 is not the creator
        chirpId: 101,
        message: 'Valid message length here.',
        setup: () => mockChirpRepo.isUserTheAuthor.mockResolvedValue(false),
        expectedError: ErrForbiddenAccess,
        expectedOutput: null,
      },
      {
        name: 'should throw ErrNotFound if chirp does not exist',
        user: { id: 1 },
        chirpId: 999, // Assuming this chirp does not exist
        message: 'Valid message length here.',
        setup: () => {
          mockChirpRepo.isUserTheAuthor.mockResolvedValue(true);
          mockChirpRepo.updateChirp.mockResolvedValue();
          mockChirpRepo.getChirpWithAuthor.mockResolvedValue([]);
        },
        expectedError: ErrNotFound,
        expectedOutput: null,
      },
    ];

    editChirpCases.forEach(
      ({
        name,
        user,
        chirpId,
        message,
        setup,
        expectedError,
        expectedOutput,
      }) => {
        it(name, async () => {
          if (setup) setup(); // Setup mocks if necessary
          if (expectedError) {
            await expect(
              chirpService.editChirp(user, chirpId, message)
            ).rejects.toThrow(expectedError);
          } else {
            const result = await chirpService.editChirp(user, chirpId, message);
            expect(result).toEqual(expectedOutput);
          }
        });
      }
    );
  });

  describe('deleteChirp', () => {
    const deleteChirpCases = [
      {
        name: 'should successfully delete a chirp when the user is the creator',
        setup: () => {
          mockChirpRepo.checkChirpExistenceAndOwner.mockResolvedValue({
            user_id: 1,
          });
          mockChirpRepo.deleteChirp.mockResolvedValue();
        },
        user: { id: 1 },
        chirpId: 101,
        expectedError: null,
      },
      {
        name: 'should throw ErrNotFound if the chirp does not exist',
        setup: () =>
          mockChirpRepo.checkChirpExistenceAndOwner.mockResolvedValue(null),
        user: { id: 1 },
        chirpId: 404, // assuming this ID does not exist
        expectedError: ErrNotFound,
      },
      {
        name: 'should throw ErrForbiddenAccess if the user is not the creator',
        setup: () =>
          mockChirpRepo.checkChirpExistenceAndOwner.mockResolvedValue({
            user_id: 2,
          }),
        user: { id: 1 },
        chirpId: 101,
        expectedError: ErrForbiddenAccess,
      },
    ];

    deleteChirpCases.forEach(
      ({ name, setup, user, chirpId, expectedError }) => {
        it(name, async () => {
          if (setup) setup(); // Setup mocks if necessary
          if (expectedError) {
            await expect(
              chirpService.deleteChirp(user, chirpId)
            ).rejects.toThrow(expectedError);
          } else {
            await expect(
              chirpService.deleteChirp(user, chirpId)
            ).resolves.toBeUndefined();
          }
        });
      }
    );
  });
});
