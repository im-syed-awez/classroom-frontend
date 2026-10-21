import { ClassDetails } from '@/types';
import { useGetIdentity, useShow } from '@refinedev/core';
import { ShowView, ShowViewHeader } from '@/components/refine-ui/views/show-view';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {AdvancedImage} from "@cloudinary/react";
import { bannerPhoto } from '@/lib/cloudinary';
import { DeleteButton } from '@/components/refine-ui/buttons/delete';

const Show = () => {
    const { query } = useShow<ClassDetails>({ resource: 'classes'});
    const { data: identity } = useGetIdentity<{ role?: string }>();
    const canManage = identity?.role === 'admin' || identity?.role === 'teacher';

    const classDetails = query.data?.data;
    const { isLoading, isError } = query;

    if(isLoading || isError || !classDetails) {
        return (
            <ShowView className="class-view class-show">
                <ShowViewHeader resource='classes' title='Class Details' showEditButton={canManage} />
                <p className='state-message'>
                    {isLoading ? 'Loading Class details...' : isError ? 'Failed to load class details...' : 'Class details not found'}
                </p>
            </ShowView>
        )
    }
    const teacherName = classDetails.teacher?.name ?? 'Unknown';
    const teacherInitials = 
        teacherName
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join('')
    
    const placeholderUrl = `https://placehold.co/600x400?text=${encodeURIComponent(teacherInitials || 'NA')}`;
    
    const { name,
      description,
      status,
      capacity,
      bannerUrl,
      bannerCldPubId,
      subject,
      teacher,
      department,
            inviteCode,
            schedules,
            enrollmentCount = 0,
    } = classDetails;
        const capacityRatio = capacity > 0 ? enrollmentCount / capacity : 0;
        const isFull = enrollmentCount >= capacity;
        const isNearFull = capacityRatio >= 0.9;

  return (
    <ShowView className="class-view class-show">
                <ShowViewHeader
                    resource='classes'
                    title='Class Details'
                    showEditButton={canManage}
                    actionsSlot={canManage ? <DeleteButton resource="classes" recordItemId={classDetails.id} size="sm">Delete Class</DeleteButton> : null}
                />
        <div className='banner'>
            {bannerCldPubId ? (
                <AdvancedImage alt="Class Banner" cldImg={bannerPhoto(bannerCldPubId, name)} />
            ) : bannerUrl ? (
                <img src={bannerUrl} alt="Class Banner" />
            ) : <div className='placeholder' />}
        </div>    

        <Card className='details-card'>
            <div className='details-header'>
                <div>
                    <h1>{name}</h1>
                    <p>{description}</p>
                </div>
                <div>
                    <Badge variant="outline">{enrollmentCount} / {capacity} students</Badge>
                    <Badge variant={status === 'active' ? 'default' : 'secondary'} data-status={status}>{status.toUpperCase()}</Badge>
                </div>
            </div>

            {isFull ? <p role="status" className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">This class has reached capacity.</p> : isNearFull ? <p role="status" className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm">This class is nearly full.</p> : null}

            {canManage && inviteCode && <div className="mt-4 rounded-md border p-3"><p className="text-sm text-muted-foreground">Student invite code</p><p className="font-mono text-lg font-semibold tracking-wider">{inviteCode}</p></div>}

            <div className='details-grid'>
                <div className='instructor'>
                    <p>Instructor</p>
                    <div>
                        <img
                            src={teacher?.image || placeholderUrl}
                            alt={teacherName}
                            onError={(event) => {
                                if (event.currentTarget.src !== placeholderUrl) {
                                    event.currentTarget.src = placeholderUrl;
                                }
                            }}
                        />

                        <div>
                            <p>{teacherName}</p>
                            <p>{teacher?.email}</p>
                        </div>
                    </div>
                </div>

                <div className='department'>
                    <p>Department</p>

                    <div>
                        <p>{department?.name}</p>
                        <p>{department?.description}</p>
                    </div>
                </div>
            </div>

            <Separator />

            <div className='subject'>
                <p>Subject</p>

                <div>
                    <Badge variant="outline">Code: {subject?.code}</Badge>
                    <p>{subject?.name}</p>
                    <p>{subject?.description}</p>
                </div>
            </div>

            <Separator />

            <div className='schedule'>
                <h2>Schedule</h2>
                {schedules?.length ? <ul>{schedules.map((schedule, index) => <li key={`${schedule.day}-${schedule.startTime}-${index}`}>{schedule.day}: {schedule.startTime}–{schedule.endTime}</li>)}</ul> : <p>No schedule set.</p>}
            </div>

            <Separator />

            <div className='join'>
                <h2>Join Class</h2>

                <ol>
                    <li>Ask your teacher for the invite code</li>
                    <li>Click on "Join Class" button</li>
                    <li>Paste the code and click "join"</li>
                </ol>
            </div>
            <Button size="lg" className='w-full' disabled>Join Class</Button>
        </Card>
    </ShowView>
  )
}

export default Show;