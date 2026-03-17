import { SA_REGIONAL_REGISTRY } from "@/data/regional-registry";
import { Category } from "@/types";

export class NormalizationUtility {
    static SECTORS: Category[] = ['Civil', 'Roads', 'Health', 'Planning', 'Structural', 'Apex'];
    
    static DOMAINS = [
        'Political', 
        'Commercial', 
        'Cultural', 
        'Environmental', 
        'Social', 
        'Infrastructure'
    ];

    static SOURCES = [
        'News Media',
        'Social Media',
        'Wikipedia',
        'GIC Internal',
        'Direct Field Intelligence'
    ];

    /**
     * Standardizes a province and municipality name
     */
    static normalizeRegion(province: string, municipality: string) {
        const provMatch = SA_REGIONAL_REGISTRY.provinces.find(p => 
            p.name.toLowerCase().includes(province.toLowerCase()) || 
            province.toLowerCase().includes(p.name.toLowerCase())
        );

        if (!provMatch) return { province, municipality, normalized: false };

        const muniMatch = provMatch.municipalities.find(m => 
            m.name.toLowerCase().includes(municipality.toLowerCase()) || 
            municipality.toLowerCase().includes(m.name.toLowerCase())
        );

        return {
            province: provMatch.name,
            municipality: muniMatch ? muniMatch.name : municipality,
            normalized: !!muniMatch
        };
    }

    /**
     * Standardizes sector/category names
     */
    static normalizeSector(input: string): Category {
        const lower = input.toLowerCase();
        if (lower.includes('road') || lower.includes('pothole') || lower.includes('transport')) return 'Roads';
        if (lower.includes('health') || lower.includes('clinic') || lower.includes('hospital')) return 'Health';
        if (lower.includes('water') || lower.includes('sewer' ) || lower.includes('sanitation')) return 'Civil';
        if (lower.includes('school') || lower.includes('education')) return 'Structural';
        if (lower.includes('plan') || lower.includes('town') || lower.includes('zoning')) return 'Planning';
        if (lower.includes('civil') || lower.includes('infrastructure')) return 'Civil';
        
        return 'Structural'; // Default fallback
    }

    /**
     * Maps raw domain strings to standard Strategic Domains
     */
    static normalizeDomain(input: string): string {
        const lower = input.toLowerCase();
        if (lower.includes('politic') || lower.includes('elect') || lower.includes('vote') || lower.includes('party')) return 'Political';
        if (lower.includes('cultur') || lower.includes('heritage') || lower.includes('language') || lower.includes('tradition')) return 'Cultural';
        if (lower.includes('commercia') || lower.includes('budget') || lower.includes('finance') || lower.includes('tender')) return 'Commercial';
        if (lower.includes('weather') || lower.includes('environ') || lower.includes('climate') || lower.includes('risk')) return 'Environmental';
        if (lower.includes('social') || lower.includes('communit') || lower.includes('sentiment')) return 'Social';
        return 'Infrastructure';
    }

    /**
     * Maps raw source strings to standard Source Types
     */
    static normalizeSource(input: string): string {
        const lower = input.toLowerCase();
        if (lower.includes('twitter') || lower.includes('facebook') || lower.includes('social') || lower.includes('x.com')) return 'Social Media';
        if (lower.includes('news') || lower.includes('article') || lower.includes('journalist')) return 'News Media';
        if (lower.includes('wikipedia') || lower.includes('wiki')) return 'Wikipedia';
        if (lower.includes('gic') || lower.includes('internal')) return 'GIC Internal';
        return 'Direct Field Intelligence';
    }
}
