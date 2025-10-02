import uuid
import random
import datetime

with open("demofile.csv", "a") as f:
    f.write("id,station,product,volume,uuid,timestamp\n")
    for i in range(10_000_000):
        station = random.randint(1,1000)
        product = random.randint(1,3)
        volume = random.random() * random.randint(1, 20)
        uid = uuid.uuid4()
        now = datetime.datetime.now()
        delta = datetime.timedelta(seconds=random.randint(0, 32_000_000))
        timestamp = now - delta
        f.write(f"{i},{station},{product},{volume:.3},{uid},{timestamp}\n")
    
