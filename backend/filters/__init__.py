from .dreamy import apply as dreamy_apply
from .noir import apply as noir_apply
from .vintage import apply as vintage_apply
from .sketch import apply as sketch_apply
from .neon import apply as neon_apply

FILTERS = {
    "dreamy": dreamy_apply,
    "noir": noir_apply,
    "vintage": vintage_apply,
    "sketch": sketch_apply,
    "neon": neon_apply,
}

FILTER_NAMES = {
    "dreamy": "Dreamy",
    "noir": "Noir",
    "vintage": "Vintage",
    "sketch": "Sketch",
    "neon": "Neon",
}