'use client';

import GitHubCalendar from 'react-github-calendar';
import { useTranslation } from 'react-i18next';

interface ContributionData {
    date: string;
    count: number;
    level: 0 | 1 | 2 | 3 | 4;
}

interface ContributionGraphProps {
    data: ContributionData[];
}

const ContributionGraph: React.FC<ContributionGraphProps> = ({ data }) => {
    const { t } = useTranslation();

    return (
        <div className="mt-4">
            <h2 className="mb-2 text-xl font-semibold dark:text-neutral-100">
                {t('recipe-contribution-graph')}
            </h2>
            <GitHubCalendar
                username=""
                years={[]}
                data={data}
                blockSize={14}
                fontSize={14}
                theme={{
                    light: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
                    dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
                }}
            />
        </div>
    );
};

export default ContributionGraph;
