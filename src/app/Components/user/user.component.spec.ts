import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserComponent } from './user.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UserService } from '../../Services/user.service';  // Adjust path accordingly
import { ToastrModule } from 'ngx-toastr';  // Import ToastrModule
import { of } from 'rxjs';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  let userService: UserService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule, 
        ToastrModule.forRoot(),  // Initialize ToastrModule
        UserComponent
      ],
      providers: [UserService]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService);

    // Mock the UserService
    spyOn(userService, 'getUsers').and.returnValue(of([])); // Mock empty user list

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch user list on init', () => {
    component.ngOnInit();
    expect(userService.getUsers).toHaveBeenCalled();
  });

  // Add more tests as needed
});
