"use client";

import { Button } from "@/components/ui/button";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MoreHorizontal } from "lucide-react";

export interface ActionMenuItem {

    label: string;

    icon?: React.ReactNode;

    variant?: "default" | "destructive";

    onClick(): void;
}

interface ActionsMenuProps {

    actions: ActionMenuItem[];
}

export default function ActionsMenu({
    actions,
}: ActionsMenuProps) {

    return (

        <DropdownMenu>

            <DropdownMenuTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon"
                    >
                        <MoreHorizontal className="size-4"/>
                    </Button>
                }
            />

            <DropdownMenuContent align="end">

                {actions.map((action, index) => (

                    <div key={action.label}>

                        <DropdownMenuItem
                            variant={action.variant}
                            onClick={action.onClick}
                        >

                            {action.icon}

                            {action.label}

                        </DropdownMenuItem>

                        {index !== actions.length - 1 && (
                            <DropdownMenuSeparator/>
                        )}

                    </div>

                ))}

            </DropdownMenuContent>

        </DropdownMenu>

    );
}