import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeesTab } from './employees-tab';

describe('EmployeesTab', () => {
  let component: EmployeesTab;
  let fixture: ComponentFixture<EmployeesTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeesTab]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeesTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
