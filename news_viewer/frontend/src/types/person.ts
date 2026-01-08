/**
 * Person-related TypeScript types
 */

export interface Person {
    id: string;
    name: string | null;
    nrc_no: string | null;
    blood_group: string | null;
    religion: string | null;
    race: string | null;
    spouse_name: string | null;
    father_name: string | null;
    mother_name: string | null;
    birthdate: string | null;
    appointment_date: string | null;
    retire_date: string | null;
    entry_date: string | null;
    depletion_type: string | null;
    sac: boolean | null;
    department: string | null;
    ministry: string | null;
    position_name: string | null;
    position_rank: number | null;
    punishments: string[];
}

export interface PersonDetails extends Person {
    positions: Position[];
    addresses: Address[];
    educations: string[];
    countries: string[];
    trainings: Training[];
}

export interface Position {
    name: string;
    rank: number | null;
}

export interface Address {
    address: string;
    permanent: boolean;
}

export interface Training {
    course: string | null;
    start_date: string | null;
    end_date: string | null;
    location: string | null;
    is_international: boolean;
}

export interface SearchResponse {
    people: Person[];
    total: number;
    offset: number;
    limit: number;
    has_more: boolean;
}

export interface Department {
    department_id: number;
    department_name: string;
    person_count: number;
}

export interface Ministry {
    ministry_name: string;
    departments: Department[];
    total_people: number;
}

export interface MinistryStructureData {
    ministries: Ministry[];
    total_ministries: number;
    total_departments: number;
}
