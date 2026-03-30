"""CLI entrypoint for piighost-chat backend."""

import argparse

import uvicorn


def main() -> None:
    parser = argparse.ArgumentParser(description="piighost-chat backend server")
    parser.add_argument("--host", default="0.0.0.0", help="Bind host")
    parser.add_argument("--port", type=int, default=8001, help="Bind port")
    parser.add_argument("--log-level", default="info", help="Log level")
    args = parser.parse_args()

    uvicorn.run(
        "piighost_chat.app:create_app",
        factory=True,
        host=args.host,
        port=args.port,
        log_level=args.log_level,
    )


if __name__ == "__main__":
    main()
