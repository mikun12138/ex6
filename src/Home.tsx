import SideBar from "./widgets/Sidebar";

import { Link } from "react-router-dom";
import "./Home.css"
import "./css/theme/theme.css"
import Button from "./widgets/Button";
import Overlay from "./widgets/Overlay";
import { useEffect, useState } from "react";

function Home() {
    const [isOverlaying, setIsOverlaying] = useState(false)
    const [isSideBarOpen, setIsSideBarOpen] = useState(false)

    useEffect(() => {
        setIsOverlaying(isSideBarOpen)
    }, [isSideBarOpen])

    return (
        <>
            <Overlay 
                isOverlaying={isOverlaying}
            />
            <SideBar
                isOpen={isSideBarOpen}
                setIsOpen={setIsSideBarOpen}
            />
            <div className="theme main">
                <Link to={"/paint"}>
                    <Button
                        x={-5}
                        y={-5}
                        width={10}
                        height={10}
                    >
                        Paint!
                    </Button>
                </Link>
                <Link to={"/config"}>
                    <Button
                        x={30}
                        y={30}
                        width={10}
                        height={15}
                    >
                        Config
                    </Button>
                </Link>
            </div>
        </>
    )
}

export default Home