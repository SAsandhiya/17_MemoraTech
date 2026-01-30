decisions = []

def save_decision(data):
    decisions.append(data)

def get_similar_decision(query):
    for d in decisions:
        if d["decision"].lower() in query.lower():
            return d
    return None

def update_decision(index, new_data):
    decisions[index] = new_data
