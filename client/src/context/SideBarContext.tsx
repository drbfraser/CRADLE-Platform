import React from 'react';

export type SideBarContextType = {
    isSideBarOpen: boolean,
    setIsSideBarOpen: Function,
}

export const SideBarContext = React.createContext<SideBarContextType>({
    isSideBarOpen: true,
    setIsSideBarOpen: () => {},
})

export const SideBarProvider: React.FC = ({children}) => {
    const [isSideBarOpen, setIsSideBarOpen] = React.useState(true);

    return (
        <SideBarContext.Provider value={{isSideBarOpen, setIsSideBarOpen}}>
            {children}
        </SideBarContext.Provider>
    )
}
