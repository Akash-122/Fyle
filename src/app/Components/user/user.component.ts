import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UserModel } from '../../Model/user';
import { FormsModule, NgForm } from '@angular/forms';
import { UserService } from '../../Services/user.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [FormsModule, CommonModule, NgxPaginationModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  @ViewChild('barChart', { static: true }) barChart!: ElementRef;

  userList: UserModel[] = [];
  aggregatedUserList: any[] = [];
  filteredUserList: any[] = [];

  user: UserModel = {
    name: "",
    workouttypes: '',
    workoutMinutes: 0
  };

  searchName: string = '';
  selectedWorkoutType: string = '';

  // Pagination variables
  page: number = 1; // Current page number
  itemsPerPage: number = 10; // Number of items per page

  // Chart variables
  chart: any;

  constructor(private _userService: UserService, private _toastrService: ToastrService) { }

  ngOnInit(): void {
    this.getUserList();
  }

  workouttypes: string[] = ["Cycling", "Running", "Walking", "Playing", "Sleeping"];

  getUserList() {
    this._userService.getUsers().subscribe(
      (res) => {
        this.userList = res;
        this.aggregateUserData();
      },
      (error) => {
        this._toastrService.error('Failed to fetch user list', 'Error');
      }
    );
  }

  aggregateUserData() {
    const userMap = new Map<string, any>();

    this.userList.forEach(user => {
      if (userMap.has(user.name)) {
        const existingUser = userMap.get(user.name);
        existingUser.workouttypes = Array.from(new Set([...existingUser.workouttypes.split(', '), user.workouttypes])).join(', ');
        existingUser.workoutMinutes += user.workoutMinutes;
      } else {
        userMap.set(user.name, {
          name: user.name,
          workouttypes: user.workouttypes,
          workoutMinutes: user.workoutMinutes,
          numberOfWorkouts: 1 // Initially count as 1
        });
      }
    });

    // Update number of workouts based on distinct workout types
    this.aggregatedUserList = Array.from(userMap.values()).map(user => ({
      ...user,
      numberOfWorkouts: user.workouttypes.split(', ').length // Count distinct workout types
    }));

    this.filterAndSearch(); // Apply filter and search after data aggregation
  }

  filterAndSearch() {
    this.filteredUserList = this.aggregatedUserList
      .filter(user =>
        (this.selectedWorkoutType === '' || user.workouttypes.split(', ').includes(this.selectedWorkoutType)) &&
        (this.searchName === '' || user.name.toLowerCase().includes(this.searchName.toLowerCase()))
      );
  }

  updateChart(user: any) {
    const workoutData = this.userList.filter(u => u.name === user.name);
    const workoutTypes = Array.from(new Set(workoutData.map(u => u.workouttypes)));
    const workoutMinutes = workoutTypes.map(type => {
      return workoutData
        .filter(u => u.workouttypes === type)
        .reduce((sum, u) => sum + u.workoutMinutes, 0);
    });

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(this.barChart.nativeElement, {
      type: 'bar',
      data: {
        labels: workoutTypes,
        datasets: [{
          label: 'Minutes',
          data: workoutMinutes,
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)', // Cycling
            'rgba(153, 102, 255, 0.6)', // Running
            'rgba(255, 159, 64, 0.6)', // Walking
            'rgba(255, 99, 132, 0.6)', // Playing
            'rgba(54, 162, 235, 0.6)'  // Sleeping
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)', // Cycling
            'rgba(153, 102, 255, 1)', // Running
            'rgba(255, 159, 64, 1)', // Walking
            'rgba(255, 99, 132, 1)', // Playing
            'rgba(54, 162, 235, 1)'  // Sleeping
          ],
          borderWidth: 1,
          barThickness: 40 // Adjust bar thickness here
        }]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: `${user.name}'s Workout Process (Minutes)`,
            font: {
              size: 16
            },
            padding: {
              top: 10,
              bottom: 10
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Minutes'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Workout Types'
            }
          }
        }
      }
    });
  }

  onRowClick(user: any) {
    this.updateChart(user);
  }

  onSubmit(form: NgForm): void {
    if (form.valid) {
      this._userService.addUser(this.user).subscribe(
        (res) => {
          this.getUserList();
          form.reset();
          this._toastrService.success('User added successfully', 'Success');
        },
        (error) => {
          this._toastrService.error('Failed to add user', 'Error');
        }
      );
    } else {
      this._toastrService.error('Form is invalid', 'Error');
    }
  }

  onResetForm() {
    this.user = {
      name: "",
      workouttypes: '',
      workoutMinutes: 0
    };
    this.searchName = ''; // Reset search input
    this.selectedWorkoutType = ''; // Reset filter dropdown
    this.filteredUserList = [...this.aggregatedUserList]; // Reset to show all data
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
