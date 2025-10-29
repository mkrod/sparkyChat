import { type FC, type JSX } from 'react'
import { TbMoodEmpty } from 'react-icons/tb';

interface Props {
    title: string;
}
const EmptyList: FC<Props> = ({ title }): JSX.Element => {

    return (
        <div style={{
            marginTop: "50%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            justifyContent: "center",
            alignItems: "center",
        }}>
            <TbMoodEmpty size={45} />
            <span style={{
                fontFamily: "Quicksand, sanserif",
                fontWeight: "700",
                fontSize: "1rem"
            }}>
                {title}
            </span>

        </div>
    )
}

export default EmptyList