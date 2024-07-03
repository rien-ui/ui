import * as React from "react";
import { createContextScope } from "@rien-ui/react-context";
import { Plain } from "@rien-ui/react-plain";
import { useCallbackRef } from "@rien-ui/react-use-callback-ref";

import type { Scope } from "@rien-ui/react-context";

/**
 * Avatar
 */

const AVATAR_NAME = "Avatar";

type ScopedProps<P> = P & { __scopeAvatar?: Scope };
const [createAvatarContext, createAvatarScope] = createContextScope(AVATAR_NAME);

type ImageLoadingStatus = "idle" | "loading" | "loaded" | "error";

type AvatarContextValue = {
  imageLoadingStatus: ImageLoadingStatus;
  onImageLoadingStatusChange(status: ImageLoadingStatus): void;
};

const [AvatarProvider, useAvatarContext] = createAvatarContext<AvatarContextValue>(AVATAR_NAME);

type AvatarElement = React.ElementRef<typeof Plain.span>;
type PlainSpanProps = React.ComponentPropsWithoutRef<typeof Plain.span>;
interface AvatarProps extends PlainSpanProps {}

const Avatar = React.forwardRef<AvatarElement, AvatarProps>(
  (props: ScopedProps<AvatarProps>, forwardedRef) => {
    const { __scopeAvatar, ...avatarProps } = props;
    const [imageLoadingStatus, setImageLoadingStatus] = React.useState<ImageLoadingStatus>("idle");
    return (
      <AvatarProvider
        scope={__scopeAvatar}
        imageLoadingStatus={imageLoadingStatus}
        onImageLoadingStatusChange={setImageLoadingStatus}
      >
        <Plain.span {...avatarProps} ref={forwardedRef} />
      </AvatarProvider>
    );
  }
);

Avatar.displayName = AVATAR_NAME;

/**
 * AvatarImage
 */

const IMAGE_NAME = "AvatarImage";

type AvatarImageElement = React.ElementRef<typeof Plain.img>;
type PlainImageProps = React.ComponentPropsWithoutRef<typeof Plain.img>;
interface AvatarImageProps extends PlainImageProps {
  onLoadingStatusChange?: (status: ImageLoadingStatus) => void;
}

const AvatarImage = React.forwardRef<AvatarImageElement, AvatarImageProps>(
  (props: ScopedProps<AvatarImageProps>, forwardedRef) => {
    const { __scopeAvatar, src, onLoadingStatusChange = () => {}, ...imageProps } = props;
    const context = useAvatarContext(IMAGE_NAME, __scopeAvatar);
    const imageLoadingStatus = useImageLoadingStatus(src);
    const handleLoadingStatusChange = useCallbackRef((status: ImageLoadingStatus) => {
      onLoadingStatusChange(status);
      context.onImageLoadingStatusChange(status);
    });

    React.useLayoutEffect(() => {
      if (imageLoadingStatus !== "idle") {
        handleLoadingStatusChange(imageLoadingStatus);
      }
    }, [imageLoadingStatus, handleLoadingStatusChange]);

    return imageLoadingStatus === "loaded" ? (
      <Plain.img {...imageProps} ref={forwardedRef} src={src} />
    ) : null;
  }
);

AvatarImage.displayName = IMAGE_NAME;

/**
 * AvatarFallback
 */

const FALLBACK_NAME = "AvatarFallback";

type AvatarFallbackElement = React.ElementRef<typeof Plain.span>;
interface AvatarFallbackProps extends PlainSpanProps {
  delayMs?: number;
}

const AvatarFallback = React.forwardRef<AvatarFallbackElement, AvatarFallbackProps>(
  (props: ScopedProps<AvatarFallbackProps>, forwardedRef) => {
    const { __scopeAvatar, delayMs, ...fallbackProps } = props;
    const context = useAvatarContext(FALLBACK_NAME, __scopeAvatar);
    const [canRender, setCanRender] = React.useState(delayMs === undefined);

    React.useEffect(() => {
      if (delayMs !== undefined) {
        const timerId = window.setTimeout(() => setCanRender(true), delayMs);
        return () => window.clearTimeout(timerId);
      }
    }, [delayMs]);

    return canRender && context.imageLoadingStatus !== "loaded" ? (
      <Plain.span {...fallbackProps} ref={forwardedRef} />
    ) : null;
  }
);

AvatarFallback.displayName = FALLBACK_NAME;

/**
 *
 */

function useImageLoadingStatus(src?: string) {
  const [loadingStatus, setLoadingStatus] = React.useState<ImageLoadingStatus>("idle");

  React.useLayoutEffect(() => {
    if (!src) {
      setLoadingStatus("error");
      return;
    }

    let isMounted = true;
    const image = new window.Image();

    const updateStatus = (status: ImageLoadingStatus) => () => {
      if (!isMounted) return;
      setLoadingStatus(status);
    };

    setLoadingStatus("loading");
    image.onload = updateStatus("loaded");
    image.onerror = updateStatus("error");
    image.src = src;

    return () => {
      isMounted = false;
    };
  }, [src]);

  return loadingStatus;
}

/* --- */
const Root = Avatar;
const Image = AvatarImage;
const Fallback = AvatarFallback;

export {
  createAvatarScope,
  //
  Avatar,
  AvatarImage,
  AvatarFallback,
  //
  Root,
  Image,
  Fallback,
};
export type { AvatarProps, AvatarImageProps, AvatarFallbackProps };
