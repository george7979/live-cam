"""Evaluate JS in a WebKitGTK page via the remote inspector WebSocket.

usage: inspector.py ws://127.0.0.1:9339/socket/1/1/WebPage 'expr' ['expr' ...]
Each expr is awaited (awaitPromise) with a timeout; output is printed as JSON.
"""
import asyncio, json, sys
import websockets

URL = sys.argv[1]
EXPRS = sys.argv[2:]


async def main():
    async with websockets.connect(URL, max_size=None) as ws:
        seq = 0
        target = None

        async def raw(msg):
            await ws.send(json.dumps(msg))

        async def call(method, params, timeout=10):
            nonlocal seq
            seq += 1
            my = seq
            if target:
                inner = {"id": my, "method": method, "params": params}
                await raw({"id": 100000 + my, "method": "Target.sendMessageToTarget",
                           "params": {"targetId": target, "message": json.dumps(inner)}})
            else:
                await raw({"id": my, "method": method, "params": params})
            loop = asyncio.get_event_loop()
            end = loop.time() + timeout
            while True:
                left = end - loop.time()
                if left <= 0:
                    return {"timeout": True}
                m = json.loads(await asyncio.wait_for(ws.recv(), left))
                if m.get("method") == "Target.dispatchMessageFromTarget":
                    m = json.loads(m["params"]["message"])
                if m.get("id") == my:
                    return m
                if m.get("method") == "Console.messageAdded":
                    print("CONSOLE:", m["params"]["message"].get("text"), flush=True)

        # Newer WebKit multiplexes page targets; wait for Target.targetCreated.
        try:
            m = json.loads(await asyncio.wait_for(ws.recv(), 2))
            if m.get("method") == "Target.targetCreated":
                target = m["params"]["targetInfo"]["targetId"]
        except asyncio.TimeoutError:
            pass
        print("target:", target, flush=True)

        for e in EXPRS:
            if e.startswith("sleep:"):
                await asyncio.sleep(float(e[6:]))
                continue
            r = await call("Runtime.evaluate", {"expression": e, "returnByValue": True,
                                                "awaitPromise": False}, timeout=10)
            res = r.get("result", r)
            if isinstance(res, dict) and "result" in res:
                res = res["result"].get("value", res["result"])
            print(">", e[:70].replace("\n", " "), "\n ", json.dumps(res)[:600], flush=True)


asyncio.run(main())
