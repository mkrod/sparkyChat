import { useChatProvider } from '@/constants/providers/chatProvider'
import { type FC, type ReactNode } from 'react'



const CallHome: FC = (): ReactNode => {
    const { isMobile } = useChatProvider();


    return !isMobile ? (
        <div>Desktop Call Screen</div>
    ): (
        <div>Mobile Call Screen</div>
    );
}

export default CallHome