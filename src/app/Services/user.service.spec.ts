import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from '../Services/user.service';
import { UserModel } from '../Model/user'; // Ensure this path is correct

describe('UserService', () => {
  let service: UserService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });

    service = TestBed.inject(UserService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  // Test case for adding a user
  it('should add a user', () => {
    const newUser: UserModel = { name: 'John Doe', workouttypes: 'Cardio', workoutMinutes: 30 };

    service.addUser(newUser).subscribe((user) => {
      expect(user).toEqual(newUser);
    });

    const req = httpTestingController.expectOne('http://localhost:3000/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newUser);
    req.flush(newUser);
  });

  // Test case for fetching users
  it('should fetch users', () => {
    const mockUsers: UserModel[] = [
      { name: 'John Doe', workouttypes: 'Cardio', workoutMinutes: 30 },
      { name: 'Jane Doe', workouttypes: 'Strength', workoutMinutes: 45 }
    ];

    service.getUsers().subscribe((users) => {
      expect(users).toEqual(mockUsers);
    });

    const req = httpTestingController.expectOne('http://localhost:3000/users');
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  // Test case for handling errors
  it('should handle error on add user', () => {
    const newUser: UserModel = { name: 'John Doe', workouttypes: 'Cardio', workoutMinutes: 30 };
    const errorMessage = 'Server error';

    service.addUser(newUser).subscribe({
      next: () => fail('expected an error, not users'),
      error: (error) => {
        expect(error.status).toBe(500);
        expect(error.error).toBe(errorMessage);
      }
    });

    const req = httpTestingController.expectOne('http://localhost:3000/users');
    expect(req.request.method).toBe('POST');
    req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
  });

  it('should handle error on fetch users', () => {
    const errorMessage = 'Server error';

    service.getUsers().subscribe({
      next: () => fail('expected an error, not users'),
      error: (error) => {
        expect(error.status).toBe(500);
        expect(error.error).toBe(errorMessage);
      }
    });

    const req = httpTestingController.expectOne('http://localhost:3000/users');
    expect(req.request.method).toBe('GET');
    req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
  });
});
