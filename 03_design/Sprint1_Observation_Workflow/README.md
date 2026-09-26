# Sprint 1 Observation Submission, Teacher Review and Anonymous Publication

## 1. Purpose

This folder contains the Sprint 1 analysis and design artefacts for one bounded Komodo Hub workflow:

> A student submits one wildlife observation report; the assigned teacher reviews it; an approved report is converted into an anonymous public record that can be viewed in the public school library.

The purpose of this design is to turn the high-level requirements in the SRS into a clear workflow, data structure and privacy boundary that can guide later implementation and testing.

This is a focused Sprint 1 workflow. It does not describe every function in Komodo Hub, such as community management, activities, species administration or public-user registration.

---

## 2. Design Scope

### Included

- Student submission of an observation report
- Teacher access to submissions from their class
- Teacher approval or rejection with feedback
- Storage of the original observation report
- Creation of an anonymous public version after approval
- Public browsing of approved anonymous reports

### Not included in this design

- Community organisation moderation
- Administrator approval as a separate second review stage
- Image upload and object storage
- Public comments, likes, favourites or reports
- Detailed authentication implementation
- Database migration scripts or backend API implementation

The team may later add an administrator moderation stage. If that decision is adopted, the workflow, state model and DFD should be updated consistently.

---

## 3. Artefacts in This Folder

| File | Diagram type | Purpose |
|---|---|---|
| `Sprint1_Observation_UseCase.drawio` | Use Case Diagram | Defines the actors and the functions they can perform in the observation workflow. |
| `Sprint1_Observation_Activity.drawio` | Activity Diagram | Shows the step-by-step flow from student submission to teacher review, feedback or anonymous publication. |
| `Sprint1_Observation_ERD.drawio` | Entity Relationship Diagram | Defines the main data entities, attributes, primary keys, foreign keys and relationships. |
| `Sprint1_Observation_DFD_Context.drawio` | Context DFD | Shows the system boundary and the data exchanged with Student, Teacher and Public Visitor. |
| `Sprint1_Observation_DFD_Level1.drawio` | Level 1 DFD | Shows the internal processes and data stores used to handle submissions, reviews and public browsing. |

All diagrams are stored as editable `.drawio` source files. They should be opened and edited using [draw.io / diagrams.net](https://app.diagrams.net/).

---

## 4. Workflow Summary

```text
Student submits an observation report
        鈫�
System stores the original report as pending
        鈫�
Assigned teacher reviews the report
        鈫�
     鈹屸攢鈹€ Rejected 鈹€鈹€鈫� Student receives feedback and status
     鈹�
     鈹斺攢鈹€ Approved 鈹€鈹€鈫� System removes student-identifying information
                              鈫�
                       Anonymous report is stored in
                       the public school library
                              鈫�
                       Public visitor can browse it
```

The workflow has one review decision: **Teacher approves?**

This keeps the Sprint 1 process bounded and matches the teaching workflow in which a student submits one observation for review by their assigned teacher.

---

## 5. Roles and Responsibilities

| Role | Responsibility in this workflow |
|---|---|
| Student | Submits an observation report and receives review feedback or publication status. |
| Teacher | Reviews reports submitted by students in their assigned class; approves or rejects with feedback. |
| Public Visitor | Browses approved anonymous reports in the public school library. |
| Komodo Hub System | Stores reports, controls workflow status, creates anonymous public records and provides public browsing. |

---

## 6. Privacy and Data Boundary

This design follows the Komodo Hub case requirement that student profiles and personal information must not be exposed to the public.

### Private data

The original observation report is stored internally. It may include:

- Student identifier
# Sprint 1 鈥� Observation Submission, Teacher Review and Anonymous Publication

## 1. Purpose

This folder contains the Sprint 1 analysis and design artefacts for one bounded Komodo Hub workflow:

> A student submits one wildlife observation report; the assigned teacher reviews it; an approved report is converted into an anonymous public record that can be viewed in the public school library.

The purpose of this design is to turn the high-level requirements in the SRS into a clear workflow, data structure and privacy boundary that can guide later implementation and testing.

This is a focused Sprint 1 workflow. It does not describe every function in Komodo Hub, such as community management, activities, species administration or public-user registration.

---

## 2. Design Scope

### Included

- Student submission of an observation report
- Teacher access to submissions from their class
- Teacher approval or rejection with feedback
- Storage of the original observation report
- Creation of an anonymous public version after approval
- Public browsing of approved anonymous reports

### Not included in this design

- Community organisation moderation
- Administrator approval as a separate second review stage
- Image upload and object storage
- Public comments, likes, favourites or reports
- Detailed authentication implementation
- Database migration scripts or backend API implementation

The team may later add an administrator moderation stage. If that decision is adopted, the workflow, state model and DFD should be updated consistently.

---

## 3. Artefacts in This Folder

| File | Diagram type | Purpose |
|---|---|---|
| `Sprint1_Observation_UseCase.drawio` | Use Case Diagram | Defines the actors and the functions they can perform in the observation workflow. |
| `Sprint1_Observation_Activity.drawio` | Activity Diagram | Shows the step-by-step flow from student submission to teacher review, feedback or anonymous publication. |
| `Sprint1_Observation_ERD.drawio` | Entity Relationship Diagram | Defines the main data entities, attributes, primary keys, foreign keys and relationships. |
| `Sprint1_Observation_DFD_Context.drawio` | Context DFD | Shows the system boundary and the data exchanged with Student, Teacher and Public Visitor. |
| `Sprint1_Observation_DFD_Level1.drawio` | Level 1 DFD | Shows the internal processes and data stores used to handle submissions, reviews and public browsing. |

All diagrams are stored as editable `.drawio` source files. They should be opened and edited using [draw.io / diagrams.net](https://app.diagrams.net/).

---

## 4. Workflow Summary

```text
Student submits an observation report
        鈫�
System stores the original report as pending
        鈫�
Assigned teacher reviews the report
        鈫�
     鈹屸攢鈹€ Rejected 鈹€鈹€鈫� Student receives feedback and status
     鈹�
     鈹斺攢鈹€ Approved 鈹€鈹€鈫� System removes student-identifying information
                              鈫�
                       Anonymous report is stored in
                       the public school library
                              鈫�
                       Public visitor can browse it
```

The workflow has one review decision: **Teacher approves?**

This keeps the Sprint 1 process bounded and matches the teaching workflow in which a student submits one observation for review by their assigned teacher.

---

## 5. Roles and Responsibilities

| Role | Responsibility in this workflow |
|---|---|
| Student | Submits an observation report and receives review feedback or publication status. |
| Teacher | Reviews reports submitted by students in their assigned class; approves or rejects with feedback. |
| Public Visitor | Browses approved anonymous reports in the public school library. |
| Komodo Hub System | Stores reports, controls workflow status, creates anonymous public records and provides public browsing. |

---

## 6. Privacy and Data Boundary

This design follows the Komodo Hub case requirement that student profiles and personal information must not be exposed to the public.

### Private data

The original observation report is stored internally. It may include:

- Student identifier
- Class identifier
- Teacher identifier
- Submission time
- Species and observation description
- Exact observation location
- Internal teacher feedback and review information

Only the relevant student and assigned teacher should access this information.

### Public data

A report enters the public school library only after teacher approval. The public version must not contain:

- Student name
- Student account identifier
- Student email
- Class identifier
- Teacher feedback
- Exact location, where revealing it may create privacy or wildlife-protection risks

The public version may retain:

- Species
- General description
- Generalised area or approximate location
- Observation date
- Publication date

This separation is represented by the `ObservationReport` and `PublicReportView` entities in the ERD, and by the separate internal and public data stores in the Level 1 DFD.

---

## 7. Relationship to the SRS

This design supports the requirements described in:

- `01_requirements/Komodo_Hub_SRS_CN.md`
- `01_requirements/Komodo_Hub_SRS_EN.md`

In particular, it provides design evidence for:

- Student observation report submission
- Teacher class management and report review
- Student鈥搕eacher relationship through class membership
- Protection of student information
- Anonymous presentation of approved reports to public users
- Separation between internal school data and public community content

The SRS defines **what** Komodo Hub should provide.  
The diagrams in this folder define **how one Sprint 1 workflow is structured**.

---

## 8. Implementation Guidance

When this workflow is implemented in a later sprint, the following rules should be preserved:

1. A student can submit a report only after joining a class.
2. A teacher can review reports only for classes assigned to that teacher.
3. A rejected report remains private and includes feedback for the student.
4. An approved report must be transformed into an anonymous public record.
5. The public library must read from the anonymous public record, not from the original student submission.
6. User-interface hiding alone is not sufficient; access control must also be enforced in the backend and database queries.
7. All approval and rejection actions should record the reviewer, time, decision and reason for later audit.

---

## 9. Suggested Acceptance Checks

| ID | Acceptance check |
|---|---|
| AC-01 | A student who belongs to a class can submit an observation report. |
| AC-02 | A student who does not belong to a class cannot submit a report. |
| AC-03 | The assigned teacher can view a pending report from their class. |
| AC-04 | A teacher can reject a report and provide feedback to the student. |
| AC-05 | A teacher can approve a report. |
| AC-06 | Approval creates an anonymous public report record. |
| AC-07 | A public visitor can browse an approved anonymous report. |
| AC-08 | A public visitor cannot see student name, student identifier, class identifier or internal feedback. |
| AC-09 | A rejected report is not displayed in the public school library. |

---

## 10. Next Steps

Possible Sprint 1 / Sprint 2 follow-up tasks:

- Add the corresponding user stories and priorities to the Product Backlog.
- Align the team decision on whether an administrator review stage is required after teacher approval.
- Map the ERD entities to the prototype data model.
- Implement teacher review actions and feedback in the web prototype.
- Add tests for approval, rejection, privacy and access-control scenarios.
- Capture screenshots and commit history as individual and team evidence.

---

## Individual Contribution

**Contributor:** Yu Yingzhuo

The analysis and creation of the five diagrams in this folder were completed by Yu Yingzhuo:

- Use Case Diagram
- Activity Diagram
- Entity Relationship Diagram (ERD)
- Context Data Flow Diagram (DFD)
- Level 1 Data Flow Diagram (DFD)
- Class identifier
- Teacher identifier
- Submission time
- Species and observation description
- Exact observation location
- Internal teacher feedback and review information

Only the relevant student and assigned teacher should access this information.

### Public data

A report enters the public school library only after teacher approval. The public version must not contain:

- Student name
- Student account identifier
- Student email
- Class identifier
- Teacher feedback
- Exact location, where revealing it may create privacy or wildlife-protection risks

The public version may retain:

- Species
- General description
- Generalised area or approximate location
- Observation date
- Publication date

This separation is represented by the `ObservationReport` and `PublicReportView` entities in the ERD, and by the separate internal and public data stores in the Level 1 DFD.

---

## 7. Relationship to the SRS

This design supports the requirements described in:

- `01_requirements/Komodo_Hub_SRS_CN.md`
- `01_requirements/Komodo_Hub_SRS_EN.md`

In particular, it provides design evidence for:

- Student observation report submission
- Teacher class management and report review
- Student鈥搕eacher relationship through class membership
- Protection of student information
- Anonymous presentation of approved reports to public users
- Separation between internal school data and public community content

The SRS defines **what** Komodo Hub should provide.  
The diagrams in this folder define **how one Sprint 1 workflow is structured**.

---

## 8. Implementation Guidance

When this workflow is implemented in a later sprint, the following rules should be preserved:

1. A student can submit a report only after joining a class.
2. A teacher can review reports only for classes assigned to that teacher.
3. A rejected report remains private and includes feedback for the student.
4. An approved report must be transformed into an anonymous public record.
5. The public library must read from the anonymous public record, not from the original student submission.
6. User-interface hiding alone is not sufficient; access control must also be enforced in the backend and database queries.
7. All approval and rejection actions should record the reviewer, time, decision and reason for later audit.

---

## 9. Suggested Acceptance Checks

| ID | Acceptance check |
|---|---|
| AC-01 | A student who belongs to a class can submit an observation report. |
| AC-02 | A student who does not belong to a class cannot submit a report. |
| AC-03 | The assigned teacher can view a pending report from their class. |
| AC-04 | A teacher can reject a report and provide feedback to the student. |
| AC-05 | A teacher can approve a report. |
| AC-06 | Approval creates an anonymous public report record. |
| AC-07 | A public visitor can browse an approved anonymous report. |
| AC-08 | A public visitor cannot see student name, student identifier, class identifier or internal feedback. |
| AC-09 | A rejected report is not displayed in the public school library. |

---

## 10. Next Steps

Possible Sprint 1 / Sprint 2 follow-up tasks:

- Add the corresponding user stories and priorities to the Product Backlog.
- Align the team decision on whether an administrator review stage is required after teacher approval.
- Map the ERD entities to the prototype data model.
- Implement teacher review actions and feedback in the web prototype.
- Add tests for approval, rejection, privacy and access-control scenarios.
- Capture screenshots and commit history as individual and team evidence.

---

## Individual Contribution

**Contributor:** Yu Yingzhuo

The analysis and creation of the five diagrams in this folder were completed by Yu Yingzhuo:

- Use Case Diagram
- Activity Diagram
- Entity Relationship Diagram (ERD)
- Context Data Flow Diagram (DFD)
- Level 1 Data Flow Diagram (DFD)
