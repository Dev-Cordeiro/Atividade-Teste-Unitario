import request from 'supertest';
import { App } from '../../../src/app';
import { IUser } from '../../../src/interfaces/IUser';
import { IUserResponse } from '../../../src/interfaces/IUserResponse';
import { UserRepository } from '../../../src/endpoints/users/userRepository';

const app = new App().server.listen(8081);

describe('UserController', () => {
  afterAll((done) => {
    app.close(done);
  });

  it('Deve retornar a lista de usuários corretamente', async () => {
    const mockUsers: IUser[] = [
      {
        id: 1,
        name: 'Lucas',
        age: 15,
      },
      {
        id: 2,
        name: 'Fernanda',
        age: 20,
      },
      {
        id: 3,
        name: 'Carlos',
        age: 30,
      },
    ];

    const expectedUsers: IUserResponse[] = [
      {
        id: 1,
        name: 'Lucas',
        age: 15,
        isOfAge: false,
      },
      {
        id: 2,
        name: 'Fernanda',
        age: 20,
        isOfAge: true,
      },
      {
        id: 3,
        name: 'Carlos',
        age: 30,
        isOfAge: true,
      },
    ];

    jest.spyOn(UserRepository.prototype, 'list').mockReturnValueOnce(mockUsers);

    const response = await request(app).get('/users');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(expectedUsers);
  });

  it('Deve retornar nenhum usuário na lista', async () => {
    const mockUsers1: IUser[] = [];

    const expectedUsers1: IUserResponse[] = [];

    jest.spyOn(UserRepository.prototype, 'list').mockReturnValueOnce(mockUsers1);

    const response = await request(app).get('/users');
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(expectedUsers1);
  });

  describe('UserController - getOne', () => {
    it('Deve retornar um único usuário por id', async () => {
      const mockUser: IUser = {
        id: 1,
        name: 'Lucas',
        age: 15,
      };

      const expectedUser: IUserResponse = {
        id: 1,
        name: 'Lucas',
        age: 15,
        isOfAge: false,
      };

      jest.spyOn(UserRepository.prototype, 'findOne').mockReturnValueOnce(mockUser);
      const response = await request(app).get('/users/1');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(expectedUser);
    });

    it('Deve retornar que o usuário não foi encontrado', async () => {
      jest.spyOn(UserRepository.prototype, 'findOne').mockReturnValueOnce(undefined);

      const response = await request(app).get('/users/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBe('Usuário não encontrado');
    });
  });

  describe('UserController - create', () => {
    it('Deve criar um usuário corretamente', async () => {
      const mockUser: IUser = {
        id: 1,
        name: 'João',
        age: 22,
      };

      jest.spyOn(UserRepository.prototype, 'save').mockReturnValueOnce(true);

      const response = await request(app).post('/users').send(mockUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBe('Usuário criado com sucesso');
    });

    it('Deve retornar 500 se a criação do usuário falhar', async () => {
      const mockUser1: IUser = {
        id: 2,
        name: 'Marcela',
        age: 25,
      };

      jest.spyOn(UserRepository.prototype, 'save').mockReturnValueOnce(false);

      const response = await request(app).post('/users').send(mockUser1);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBe('Falha ao criar o usuário');
    });
  });

  describe('UserController - delete', () => {
    it('Deve excluir um usuário corretamente', async () => {
      jest.spyOn(UserRepository.prototype, 'delete').mockReturnValueOnce(true);

      const response = await request(app).delete('/users/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBe('Usuário excluído com sucesso');
    });

    it('Deve retornar erro 500 ao falhar em excluir o usuário', async () => {
      jest.spyOn(UserRepository.prototype, 'delete').mockReturnValueOnce(false);

      const response = await request(app).delete('/users/1');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.data).toBe('Falha ao remover o usuário');
    });
  });
});
