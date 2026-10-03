import { useEffect, useRef } from "react"

type Observer = {
    callback: () => void,
    options?: IntersectionObserverInit
}

function useIntersectionObserver({
    callback,
    options
}: Observer) {

    const targetRef = useRef<HTMLDivElement | null>(null)
    useEffect(() => {
        const target = targetRef.current
        if (!target) return
        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];

                if (entry.isIntersecting) {
                    callback();
                }
            },
            options
        );

        observer.observe(target);

        return () => {
            observer.disconnect();
        };
    }, [callback,options])

    return targetRef

}


export default useIntersectionObserver