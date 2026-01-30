def compare_context(past, present):
    changes = []
    for key in past:
        if past[key] != present[key]:
            changes.append(key)

    suggestion = (
        "Earlier decision was based on "
        f"{past}. Now, changes in {changes} make the situation different."
    )
    return suggestion
