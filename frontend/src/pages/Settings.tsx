import { FC } from 'react';
import { Card, CardContent } from '../components/ui/Card';

export const Settings: FC = () => {
    return (
        <div className="container mx-auto p-8">
            <h1 className="text-2xl font-bold mb-4">Settings</h1>
            <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    Settings Module Coming Soon
                </CardContent>
            </Card>
        </div>
    );
};
