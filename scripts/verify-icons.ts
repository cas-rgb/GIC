import * as Icons from 'lucide-react';

const requiredIcons = [
    'CheckCircle2',
    'AlertCircle',
    'RefreshCw',
    'MapPin',
    'Target',
    'Flag',
    'Globe',
    'ShieldCheck',
    'Users',
    'Briefcase',
    'Activity',
    'Calendar'
];

console.log('Verifying Lucide Icons:');
requiredIcons.forEach(name => {
    if ((Icons as any)[name]) {
        console.log(`✅ ${name}`);
    } else {
        console.log(`❌ ${name}`);
    }
});
