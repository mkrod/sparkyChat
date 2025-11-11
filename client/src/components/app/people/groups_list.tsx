import type { FC, ReactNode } from "react"

interface Props {
    container: HTMLDivElement | null;
}

const GroupsList: FC<Props> = ({ }): ReactNode => {
  return (
    <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "350px",
        fontFamily: "Bricolage Grotesque, sans-serif"
    }}>
        Coming soon
    </div>
  )
}

export default GroupsList