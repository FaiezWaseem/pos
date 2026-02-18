import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, CheckCircle2, UserCheck } from 'lucide-react';

interface Shift {
    id: number;
    start_time: string;
    end_time: string;
    status: string;
}

interface Attendance {
    id: number;
    clock_in: string;
    clock_out: string | null;
    total_hours: number | null;
}

interface Props {
    isClockedIn: boolean;
    currentSession: Attendance | null;
    recentActivity: Attendance[];
    upcomingShifts: Shift[];
}

export default function HrIndex({ isClockedIn, currentSession, recentActivity, upcomingShifts }: Props) {
    const handleClockIn = () => router.post('/hr/clock-in');
    const handleClockOut = () => router.post('/hr/clock-out');

    return (
        <AppLayout breadcrumbs={[{ title: 'HR', href: '/hr' }]}>
            <Head title="HR Dashboard" />
            <div className="flex flex-col gap-6 p-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Clock In/Out Card */}
                    <Card className={isClockedIn ? "border-green-500 bg-green-50/50" : "border-orange-500 bg-orange-50/50"}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Time Clock
                            </CardTitle>
                            <CardDescription>
                                {isClockedIn && currentSession
                                    ? `Clocked in at ${new Date(currentSession.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                    : "You are currently clocked out."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isClockedIn ? (
                                <Button className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={handleClockOut}>
                                    Clock Out
                                </Button>
                            ) : (
                                <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={handleClockIn}>
                                    Clock In
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming Shifts */}
                    <Card className="col-span-1 md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Upcoming Shifts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {upcomingShifts.length === 0 ? (
                                <p className="text-muted-foreground text-sm">No upcoming shifts scheduled.</p>
                            ) : (
                                <div className="space-y-4">
                                    {upcomingShifts.map(shift => (
                                        <div key={shift.id} className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0">
                                            <div>
                                                <div className="font-semibold">{new Date(shift.start_time).toLocaleDateString()}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {new Date(shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                                    {new Date(shift.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <Badge variant="outline">{shift.status}</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserCheck className="h-5 w-5" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentActivity.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No recent activity.</p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left border-b">
                                        <th className="pb-2">Date</th>
                                        <th className="pb-2">Clock In</th>
                                        <th className="pb-2">Clock Out</th>
                                        <th className="pb-2">Total Hours</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentActivity.map(activity => (
                                        <tr key={activity.id} className="border-b last:border-0">
                                            <td className="py-2">{new Date(activity.clock_in).toLocaleDateString()}</td>
                                            <td className="py-2">{new Date(activity.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                            <td className="py-2">
                                                {activity.clock_out
                                                    ? new Date(activity.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    : <Badge variant="secondary" className="bg-green-100 text-green-800">Active</Badge>}
                                            </td>
                                            <td className="py-2">{activity.total_hours ? `${Number(activity.total_hours).toFixed(2)} hrs` : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
