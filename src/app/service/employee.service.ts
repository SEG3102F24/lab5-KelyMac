import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Employee } from '../model/employee';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private firestore: Firestore = inject(Firestore);
  private employees$: BehaviorSubject<readonly Employee[]> = new BehaviorSubject<readonly Employee[]>([]);

  get $(): Observable<readonly Employee[]> {
    return this.employees$.asObservable();
  }

  constructor() {
    this.getEmployees();
  }

  private getEmployees(): void {
    const employeesCollection = collection(this.firestore, 'employees');
    collectionData(employeesCollection, { idField: 'id' })
      .pipe(
        map((documents: any[]) => {
          return documents.map(doc => ({
            name: doc.name,
            dateOfBirth: new Date(doc.dateOfBirth),
            city: doc.city,
            salary: doc.salary,
            gender: doc.gender,
            email: doc.email
          }) as Employee);
        })
      )
      .subscribe(
        (employees: Employee[]) => {
          console.log('Loaded employees from Firestore:', employees);
          this.employees$.next(employees);
        },
        (error: any) => {
          console.error('Error loading employees:', error);
        }
      );
  }

  addEmployee(employee: Employee): Promise<void> {
    const employeesCollection = collection(this.firestore, 'employees');
    const employeeData = {
      name: employee.name,
      dateOfBirth: employee.dateOfBirth.toISOString(),
      city: employee.city,
      salary: employee.salary,
      gender: employee.gender,
      email: employee.email
    };
    return addDoc(employeesCollection, employeeData)
      .then(() => {
        console.log('Employee added to Firestore');
      })
      .catch((error: any) => {
        console.error('Error adding employee to Firestore:', error);
      });
  }
}
