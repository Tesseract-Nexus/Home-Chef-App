import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

export interface WorkingHours {
  start: string; // "09:00"
  end: string;   // "21:00"
}

export interface DaySchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isWorking: boolean;
  hours: WorkingHours;
}

export interface WeeklySchedule {
  id: string;
  chefId: string;
  chefName: string;
  weekStartDate: Date; // Monday of the week
  weekEndDate: Date;   // Sunday of the week
  schedule: DaySchedule[];
  status: 'active' | 'pending_approval' | 'approved' | 'rejected';
  isCurrentWeek: boolean;
  canEdit: boolean; // false if week has started and has orders
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
}

export interface ScheduleChangeRequest {
  id: string;
  chefId: string;
  chefName: string;
  currentSchedule: WeeklySchedule;
  requestedSchedule: DaySchedule[];
  reason: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
}

interface WorkingHoursContextType {
  schedules: WeeklySchedule[];
  changeRequests: ScheduleChangeRequest[];
  getCurrentWeekSchedule: (chefId: string) => WeeklySchedule | null;
  getNextWeekSchedule: (chefId: string) => WeeklySchedule | null;
  updateSchedule: (chefId: string, schedule: DaySchedule[], weekStartDate: Date) => Promise<boolean>;
  requestScheduleChange: (chefId: string, newSchedule: DaySchedule[], reason: string) => Promise<boolean>;
  approveScheduleChange: (requestId: string, approverNotes?: string) => Promise<boolean>;
  rejectScheduleChange: (requestId: string, reason: string) => Promise<boolean>;
  canEditCurrentWeek: (chefId: string) => boolean;
  hasActiveOrders: (chefId: string, weekStartDate: Date) => boolean;
  getDefaultSchedule: () => DaySchedule[];
}

const WorkingHoursContext = createContext<WorkingHoursContextType | undefined>(undefined);

export const useWorkingHours = () => {
  const context = useContext(WorkingHoursContext);
  if (context === undefined) {
    throw new Error('useWorkingHours must be used within a WorkingHoursProvider');
  }
  return context;
};

interface WorkingHoursProviderProps {
  children: ReactNode;
}

export const WorkingHoursProvider: React.FC<WorkingHoursProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [schedules, setSchedules] = useState<WeeklySchedule[]>([]);
  const [changeRequests, setChangeRequests] = useState<ScheduleChangeRequest[]>([]);

  // Get start of current week (Monday)
  const getCurrentWeekStart = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
    return new Date(now.setDate(diff));
  };

  // Get start of next week
  const getNextWeekStart = () => {
    const currentWeekStart = getCurrentWeekStart();
    return new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  };

  const getDefaultSchedule = (): DaySchedule[] => [
    { day: 'monday', isWorking: true, hours: { start: '10:00', end: '21:00' } },
    { day: 'tuesday', isWorking: true, hours: { start: '10:00', end: '21:00' } },
    { day: 'wednesday', isWorking: true, hours: { start: '10:00', end: '21:00' } },
    { day: 'thursday', isWorking: true, hours: { start: '10:00', end: '21:00' } },
    { day: 'friday', isWorking: true, hours: { start: '10:00', end: '21:00' } },
    { day: 'saturday', isWorking: true, hours: { start: '10:00', end: '21:00' } },
    { day: 'sunday', isWorking: false, hours: { start: '10:00', end: '21:00' } },
  ];

  // Initialize default schedules for chef
  useEffect(() => {
    if (user && user.role === 'chef' && schedules.length === 0) {
      const currentWeekStart = getCurrentWeekStart();
      const nextWeekStart = getNextWeekStart();

      const currentWeekSchedule: WeeklySchedule = {
        id: `schedule_${user.id}_current`,
        chefId: user.id,
        chefName: user.name,
        weekStartDate: currentWeekStart,
        weekEndDate: new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000),
        schedule: getDefaultSchedule(),
        status: 'active',
        isCurrentWeek: true,
        canEdit: false, // Cannot edit current week once it has started
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      };

      const nextWeekSchedule: WeeklySchedule = {
        id: `schedule_${user.id}_next`,
        chefId: user.id,
        chefName: user.name,
        weekStartDate: nextWeekStart,
        weekEndDate: new Date(nextWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000),
        schedule: getDefaultSchedule(),
        status: 'active',
        isCurrentWeek: false,
        canEdit: true, // Can edit future weeks
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setSchedules([currentWeekSchedule, nextWeekSchedule]);
    }
  }, [user]);

  const getCurrentWeekSchedule = (chefId: string): WeeklySchedule | null => {
    return schedules.find(s => s.chefId === chefId && s.isCurrentWeek) || null;
  };

  const getNextWeekSchedule = (chefId: string): WeeklySchedule | null => {
    const nextWeekStart = getNextWeekStart();
    return schedules.find(s => 
      s.chefId === chefId && 
      s.weekStartDate.getTime() === nextWeekStart.getTime()
    ) || null;
  };

  const hasActiveOrders = (chefId: string, weekStartDate: Date): boolean => {
    // In a real app, this would check if there are any orders for this chef in this week
    // For now, we'll simulate that current week always has orders
    const currentWeekStart = getCurrentWeekStart();
    return weekStartDate.getTime() <= currentWeekStart.getTime();
  };

  const canEditCurrentWeek = (chefId: string): boolean => {
    const currentSchedule = getCurrentWeekSchedule(chefId);
    if (!currentSchedule) return false;
    
    // Cannot edit if week has started and has active orders
    return !hasActiveOrders(chefId, currentSchedule.weekStartDate);
  };

  const updateSchedule = async (chefId: string, schedule: DaySchedule[], weekStartDate: Date): Promise<boolean> => {
    const currentWeekStart = getCurrentWeekStart();
    const isCurrentWeek = weekStartDate.getTime() === currentWeekStart.getTime();

    // If trying to edit current week with active orders, require admin approval
    if (isCurrentWeek && hasActiveOrders(chefId, weekStartDate)) {
      return requestScheduleChange(chefId, schedule, 'Emergency schedule change for current week');
    }

    // Update future week schedule directly
    setSchedules(prev => prev.map(s => {
      if (s.chefId === chefId && s.weekStartDate.getTime() === weekStartDate.getTime()) {
        return {
          ...s,
          schedule,
          updatedAt: new Date(),
          status: 'active'
        };
      }
      return s;
    }));

    return true;
  };

  const requestScheduleChange = async (chefId: string, newSchedule: DaySchedule[], reason: string): Promise<boolean> => {
    const currentSchedule = getCurrentWeekSchedule(chefId);
    if (!currentSchedule) return false;

    const changeRequest: ScheduleChangeRequest = {
      id: `request_${Date.now()}`,
      chefId,
      chefName: user?.name || 'Chef',
      currentSchedule,
      requestedSchedule: newSchedule,
      reason,
      requestedAt: new Date(),
      status: 'pending',
    };

    setChangeRequests(prev => [...prev, changeRequest]);

    // Notify admin
    addNotification({
      type: 'system',
      title: 'Schedule Change Request',
      message: `${user?.name} has requested to change working hours for current week: ${reason}`,
      isRead: false,
    });

    return true;
  };

  const approveScheduleChange = async (requestId: string, approverNotes?: string): Promise<boolean> => {
    const request = changeRequests.find(r => r.id === requestId);
    if (!request) return false;

    // Update the schedule
    setSchedules(prev => prev.map(s => {
      if (s.id === request.currentSchedule.id) {
        return {
          ...s,
          schedule: request.requestedSchedule,
          updatedAt: new Date(),
          status: 'approved',
          approvedBy: user?.id,
          approvedAt: new Date(),
        };
      }
      return s;
    }));

    // Update request status
    setChangeRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'approved',
          reviewedBy: user?.id,
          reviewedAt: new Date(),
          reviewNotes: approverNotes,
        };
      }
      return r;
    }));

    // Notify chef
    addNotification({
      type: 'system',
      title: 'Schedule Change Approved ✅',
      message: `Your working hours change request has been approved. ${approverNotes || ''}`,
      isRead: false,
    });

    return true;
  };

  const rejectScheduleChange = async (requestId: string, reason: string): Promise<boolean> => {
    setChangeRequests(prev => prev.map(r => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'rejected',
          reviewedBy: user?.id,
          reviewedAt: new Date(),
          reviewNotes: reason,
        };
      }
      return r;
    }));

    // Notify chef
    addNotification({
      type: 'system',
      title: 'Schedule Change Rejected ❌',
      message: `Your working hours change request has been rejected. Reason: ${reason}`,
      isRead: false,
    });

    return true;
  };

  const contextValue: WorkingHoursContextType = {
    schedules,
    changeRequests,
    getCurrentWeekSchedule,
    getNextWeekSchedule,
    updateSchedule,
    requestScheduleChange,
    approveScheduleChange,
    rejectScheduleChange,
    canEditCurrentWeek,
    hasActiveOrders,
    getDefaultSchedule,
  };

  return (
    <WorkingHoursContext.Provider value={contextValue}>
      {children}
    </WorkingHoursContext.Provider>
  );
};